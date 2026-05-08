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
    
    console.log('\n--- Service Providers ---');
    const providers = await client.query('SELECT * FROM service_provider');
    console.table(providers.rows);

    console.log('\n--- Services ---');
    const services = await client.query('SELECT * FROM service');
    console.table(services.rows);

    console.log('\n--- Providing (Junction) ---');
    const providing = await client.query('SELECT * FROM providing');
    console.table(providing.rows);

    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
