const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'malakmss2004',
  database: 'family_care',
});

async function alterTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('ALTER TABLE document ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'pending\'');
    await client.query('ALTER TABLE document ADD COLUMN IF NOT EXISTS id_user INT REFERENCES "user"(id) ON DELETE CASCADE');
    await client.query('ALTER TABLE document ADD COLUMN IF NOT EXISTS rejection_reason TEXT');

    console.log('Document table altered successfully');
    await client.end();
  } catch (err) {
    console.error('Error altering table:', err);
    await client.end();
    process.exit(1);
  }
}

alterTable();
