const { Client } = require('pg');
const client = new Client({
  host: 'localhost', port: 5432, user: 'postgres', password: 'malakmss2004', database: 'family_care',
});

async function check() {
  try {
    await client.connect();
    const users = await client.query('SELECT id, fname, lname, email FROM "user"');
    console.log('USERS:', users.rows);
    const providers = await client.query('SELECT * FROM service_provider');
    console.log('PROVIDERS:', providers.rows);
    await client.end();
  } catch (err) {
    console.error(err);
    await client.end();
  }
}
check();
