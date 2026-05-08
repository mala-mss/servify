const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'malakmss2004',
  database: 'family_care',
});

async function check() {
  try {
    await client.connect();
    const res = await client.query('SELECT email FROM account');
    console.log('Emails in account table:', res.rows.map(r => r.email));
    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
