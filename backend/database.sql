
CREATE TABLE account (
  email           VARCHAR(100) PRIMARY KEY,
  password        VARCHAR(255) NOT NULL,
  status          VARCHAR(20)  DEFAULT 'active',
  nbr_warning     INT          DEFAULT 0,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE "user" (
  id              SERIAL PRIMARY KEY,
  fname           VARCHAR(100) NOT NULL,
  lname           VARCHAR(100) NOT NULL,
  address         TEXT,
  phone_number    VARCHAR(20),
  profile_picture TEXT,
  email           VARCHAR(100) UNIQUE NOT NULL REFERENCES account(email) ON DELETE CASCADE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE admin (
  idU_A   INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE
);


CREATE TABLE client (
  idU_cl  INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE
);


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
);


CREATE TABLE inscription_request (
  id_R                SERIAL PRIMARY KEY,
  status              VARCHAR(20) DEFAULT 'pending',
  submitted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_U_SP             INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE
);


CREATE TABLE authorized_person (
  id_AP         SERIAL PRIMARY KEY,
  name          VARCHAR(100),
  phone_number  VARCHAR(20),
  national_id   VARCHAR(50),
  id_U_CL       INT REFERENCES client(idU_cl) ON DELETE CASCADE
);

CREATE TABLE dependant (
  id_dep        SERIAL PRIMARY KEY,
  name          VARCHAR(100),
  date_of_birth DATE,
  relationship  VARCHAR(50),
  id_U_CL       INT REFERENCES client(idU_cl) ON DELETE CASCADE
);


CREATE TABLE medical_info (
  id_dep      INT PRIMARY KEY REFERENCES dependant(id_dep) ON DELETE CASCADE,
  blood_type  VARCHAR(10),
  allergies   TEXT,
  medications TEXT,
  conditions  TEXT
);

CREATE TABLE dependant_file (
  id_dep  INT PRIMARY KEY REFERENCES dependant(id_dep) ON DELETE CASCADE,
  link    TEXT,
  type    VARCHAR(50)
);


CREATE TABLE service_category (
  id_C        SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  target_demographics TEXT,
  policies    TEXT,
  icon        TEXT
);

CREATE TABLE service (
  id_S        SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  base_price  NUMERIC(10,2),
  id_C        INT REFERENCES service_category(id_C) ON DELETE SET NULL
);


CREATE TABLE providing (
  idU_SP  INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
  id_S    INT REFERENCES service(id_S) ON DELETE CASCADE,
  PRIMARY KEY (idU_SP, id_S)
);


CREATE TABLE document (
  id_DOC      SERIAL PRIMARY KEY,
  name        VARCHAR(100),
  link        TEXT,
  type        VARCHAR(50),
  width       INT,
  idU_SP      INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
  idU_CL      INT REFERENCES client(idU_cl) ON DELETE SET NULL
);


CREATE TABLE specifications (
  id_SPEC   SERIAL PRIMARY KEY,
  url       TEXT,
  description TEXT,
  id_DOC    INT REFERENCES document(id_DOC) ON DELETE CASCADE
);


CREATE TABLE booking_request (
  id_R        SERIAL,
  idU_cl      INT REFERENCES client(idU_cl) ON DELETE CASCADE,
  idU_sp      INT REFERENCES service_provider(idU_sp) ON DELETE CASCADE,
  id_dep      INT REFERENCES dependant(id_dep) ON DELETE SET NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  duration    INTERVAL,
  status      VARCHAR(20) DEFAULT 'pending',
  service_id  INT REFERENCES service(id_S),
  PRIMARY KEY (id_R, idU_cl, idU_sp)
);


CREATE TABLE booking (
  id_B              SERIAL,
  idU_cl            INT REFERENCES client(idU_cl) ON DELETE CASCADE,
  idU_SP            INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
  id_dep            INT REFERENCES dependant(id_dep) ON DELETE SET NULL,
  date              DATE NOT NULL,
  time              TIME NOT NULL,
  address           TEXT,
  status            VARCHAR(20) DEFAULT 'confirmed',
  service_id        INT REFERENCES service(id_S),
  PRIMARY KEY (id_B, idU_cl, idU_SP)
);


CREATE TABLE payment (
  id_P            SERIAL PRIMARY KEY,
  id_S            INT REFERENCES service(id_S),
  amount          NUMERIC(10,2) NOT NULL,
  currency        VARCHAR(3)   DEFAULT 'DZD',
  status          VARCHAR(20)  DEFAULT 'unpaid',
  payment_method  VARCHAR(50),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


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
);


CREATE TABLE file (
  idF     SERIAL PRIMARY KEY,
  url     TEXT,
  type    VARCHAR(50),
  idT     INT,
  idU_cl  INT,
  idU_SP  INT,
  FOREIGN KEY (idT, idU_cl, idU_SP) REFERENCES task(idT, idU_cl, idU_SP) ON DELETE CASCADE
);

CREATE TABLE report (
  id_reporter   VARCHAR(100) REFERENCES account(email) ON DELETE CASCADE,
  id_reported   VARCHAR(100) REFERENCES account(email) ON DELETE CASCADE,
  reason        TEXT,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_reporter, id_reported)
);

CREATE TABLE feedback (
  idU_cl          INT REFERENCES client(idU_cl) ON DELETE CASCADE,
  idU_SP          INT REFERENCES service_provider(idU_SP) ON DELETE CASCADE,
  overall_rating  NUMERIC(3,2),
  punctuality     NUMERIC(3,2),
  comment         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idU_cl, idU_SP)
);

CREATE TABLE notification (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES "user"(id) ON DELETE CASCADE,
  title         VARCHAR(100) NOT NULL,
  description   TEXT,
  type          VARCHAR(20),
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
