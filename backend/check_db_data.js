const { Client } = require('pg');
const client = new Client({
  host: 'localhost', port: 5432, user: 'postgres', password: 'malakmss2004', database: 'family_care',
});

async function check() {
  try {
    await client.connect();
    const services = await client.query("SELECT * FROM service LIMIT 5");
    console.log('SERVICES:', services.rows);
    const providing = await client.query("SELECT * FROM providing LIMIT 5");
    console.log('PROVIDING:', providing.rows);
    const providers = await client.query("SELECT * FROM service_provider LIMIT 5");
    console.log('PROVIDERS:', providers.rows);
    await client.end();
  } catch (err) {
    console.error(err);
    await client.end();
  }
}
check();
