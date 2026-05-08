const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'malakmss2004',
  database: 'family_care',
});

async function listTables() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
listTables();
