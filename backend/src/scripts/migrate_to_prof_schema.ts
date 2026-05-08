import { query } from '../db';

async function migrateToProfSchema() {
  const client = await query('BEGIN');

  try {
    console.log('Starting migration to professor schema...');

    // 1. Drop old tables that will be recreated
    console.log('Dropping old tables...');
    await query('DROP TABLE IF EXISTS feedback CASCADE');
    await query('DROP TABLE IF EXISTS report CASCADE');
    await query('DROP TABLE IF EXISTS file CASCADE');
    await query('DROP TABLE IF EXISTS task CASCADE');
    await query('DROP TABLE IF EXISTS payment CASCADE');
    await query('DROP TABLE IF EXISTS booking CASCADE');
    await query('DROP TABLE IF EXISTS booking_request CASCADE');
    await query('DROP TABLE IF EXISTS specifications CASCADE');
    await query('DROP TABLE IF EXISTS document CASCADE');
    await query('DROP TABLE IF EXISTS providing CASCADE');
    await query('DROP TABLE IF EXISTS service CASCADE');
    await query('DROP TABLE IF EXISTS service_category CASCADE');
    await query('DROP TABLE IF EXISTS dependant_file CASCADE');
    await query('DROP TABLE IF EXISTS medical_info CASCADE');
    await query('DROP TABLE IF EXISTS dependant CASCADE');
    await query('DROP TABLE IF EXISTS authorized_person CASCADE');
    await query('DROP TABLE IF EXISTS inscription_request CASCADE');
    await query('DROP TABLE IF EXISTS service_provider CASCADE');
    await query('DROP TABLE IF EXISTS client CASCADE');
    await query('DROP TABLE IF EXISTS admin CASCADE');

    // 2. Recreate all tables with professor's schema
    console.log('Creating new tables...');

    // Admin
    await query(`
      CREATE TABLE admin (
        idU_A   INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE
      )
    `);

    // Client
    await query(`
      CREATE TABLE client (
        idU_cl  INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE
      )
    `);

    // ServiceProvider
    await query(`
      CREATE TABLE service_provider (
        idU_SP            INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
        bio               TEXT,
        years_of_exp      INT           DEFAULT 0,
        work_outside_city BOOLEAN         DEFAULT FALSE,
        work_late         BOOLEAN         DEFAULT FALSE,
        rating            NUMERIC(3,2)    DEFAULT 0,
        review_count      INT             DEFAULT 0,
        price_per_hour    NUMERIC(10,2),
        day_of_week       VARCHAR(10),
        start_time        TIME,
        end_time          TIME
      )
    `);

    // Inscription Request
    await query(`
      CREATE TABLE inscription_request (
        id_R                SERIAL PRIMARY KEY,
        status              VARCHAR(20) DEFAULT 'pending',
        submitted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        id_U_SP             INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE
      )
    `);

    // Authorized Person
    await query(`
      CREATE TABLE authorized_person (
        id_AP         SERIAL PRIMARY KEY,
        name          VARCHAR(100),
        phone_number  VARCHAR(20),
        national_id   VARCHAR(50),
        id_U_CL       INT REFERENCES client(idU_cl) ON DELETE CASCADE
      )
    `);

    // Dependant
    await query(`
      CREATE TABLE dependant (
        id_dep        SERIAL PRIMARY KEY,
        name          VARCHAR(100),
        date_of_birth DATE,
        relationship  VARCHAR(50),
        id_U_CL       INT REFERENCES client(idU_cl) ON DELETE CASCADE
      )
    `);

    // Medical Info
    await query(`
      CREATE TABLE medical_info (
        id_dep      INT PRIMARY KEY REFERENCES dependant(id_dep) ON DELETE CASCADE,
        blood_type  VARCHAR(10),
        allergies   TEXT,
        medications TEXT,
        conditions  TEXT
      )
    `);

    // Dependant File
    await query(`
      CREATE TABLE dependant_file (
        id_dep  INT PRIMARY KEY REFERENCES dependant(id_dep) ON DELETE CASCADE,
        link    TEXT,
        type    VARCHAR(50)
      )
    `);

    // Service Category
    await query(`
      CREATE TABLE service_category (
        id_C        SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        target_demographics TEXT,
        policies    TEXT,
        icon        TEXT
      )
    `);

    // Service
    await query(`
      CREATE TABLE service (
        id_S        SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        description TEXT,
        base_price  NUMERIC(10,2),
        id_C        INT REFERENCES service_category(id_C) ON DELETE SET NULL
      )
    `);

    // Providing
    await query(`
      CREATE TABLE providing (
        idU_SP  INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
        id_S    INT REFERENCES service(id_S) ON DELETE CASCADE,
        PRIMARY KEY (idU_SP, id_S)
      )
    `);

    // Document
    await query(`
      CREATE TABLE document (
        id_DOC      SERIAL PRIMARY KEY,
        name        VARCHAR(100),
        link        TEXT,
        type        VARCHAR(50),
        width       INT,
        idU_SP      INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
        idU_CL      INT REFERENCES client(idU_cl) ON DELETE SET NULL
      )
    `);

    // Specifications
    await query(`
      CREATE TABLE specifications (
        id_SPEC   SERIAL PRIMARY KEY,
        url       TEXT,
        description TEXT,
        id_DOC    INT REFERENCES document(id_DOC) ON DELETE CASCADE
      )
    `);

    // Booking Request (composite PK)
    await query(`
      CREATE TABLE booking_request (
        id_R        SERIAL,
        idU_cl      INT REFERENCES client(idU_cl) ON DELETE CASCADE,
        idU_SP      INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
        date        DATE NOT NULL,
        time        TIME NOT NULL,
        duration    INTERVAL,
        status      VARCHAR(20) DEFAULT 'pending',
        service_id  INT REFERENCES service(id_S),
        PRIMARY KEY (id_R, idU_cl, idU_SP)
      )
    `);

    // Booking (composite PK)
    await query(`
      CREATE TABLE booking (
        id_B              SERIAL,
        idU_cl            INT REFERENCES client(idU_cl) ON DELETE CASCADE,
        idU_SP            INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
        date              DATE NOT NULL,
        time              TIME NOT NULL,
        address           TEXT,
        status            VARCHAR(20) DEFAULT 'confirmed',
        PRIMARY KEY (id_B, idU_cl, idU_SP)
      )
    `);

    // Payment
    await query(`
      CREATE TABLE payment (
        id_P            SERIAL PRIMARY KEY,
        id_S            INT REFERENCES service(id_S),
        amount          NUMERIC(10,2) NOT NULL,
        currency        VARCHAR(3)   DEFAULT 'DZD',
        status          VARCHAR(20)  DEFAULT 'unpaid',
        payment_method  VARCHAR(50),
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Task (composite PK)
    await query(`
      CREATE TABLE task (
        idT             SERIAL,
        idU_cl          INT REFERENCES client(idU_cl) ON DELETE CASCADE,
        idU_SP          INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
        name            VARCHAR(100),
        start_time      TIMESTAMP,
        end_time        TIMESTAMP,
        duration        INTERVAL,
        status          VARCHAR(50) DEFAULT 'not_started',
        PRIMARY KEY (idT, idU_cl, idU_SP)
      )
    `);

    // File
    await query(`
      CREATE TABLE file (
        idF     SERIAL PRIMARY KEY,
        url     TEXT,
        type    VARCHAR(50),
        idT     INT REFERENCES task(idT) ON DELETE CASCADE
      )
    `);

    // Report
    await query(`
      CREATE TABLE report (
        id_reporter   VARCHAR(100) REFERENCES account(email) ON DELETE CASCADE,
        id_reported   VARCHAR(100) REFERENCES account(email) ON DELETE CASCADE,
        reason        TEXT,
        description   TEXT,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_reporter, id_reported)
      )
    `);

    // Feedback (composite PK)
    await query(`
      CREATE TABLE feedback (
        idU_cl          INT REFERENCES client(idU_cl) ON DELETE CASCADE,
        idU_SP          INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
        overall_rating  NUMERIC(3,2),
        punctuality     NUMERIC(3,2),
        comment         TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (idU_cl, idU_SP)
      )
    `);

    await query('COMMIT');
    console.log('Migration completed successfully!');
    console.log('');
    console.log('New schema summary:');
    console.log('- booking_request: composite PK (id_R, idU_cl, idU_SP)');
    console.log('- booking: composite PK (id_B, idU_cl, idU_SP)');
    console.log('- task: composite PK (idT, idU_cl, idU_SP)');
    console.log('- feedback: composite PK (idU_cl, idU_SP)');
    console.log('- report: composite PK (id_reporter, id_reported)');
    console.log('- providing: composite PK (idU_SP, id_S)');

  } catch (error) {
    await query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

migrateToProfSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
