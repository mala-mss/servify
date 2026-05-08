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
    
    const users = await client.query('SELECT id, fname, lname, email FROM "user"');
    console.log('\n--- Users ---');
    console.table(users.rows);

    const providers = await client.query('SELECT id, user_id, bio FROM service_provider');
    console.log('\n--- Service Providers ---');
    console.table(providers.rows);

    const services = await client.query('SELECT id_service, name, category_id_fk FROM service');
    console.log('\n--- Services ---');
    console.table(services.rows);

    const junction = await client.query('SELECT * FROM service_provider_service');
    console.log('\n--- Provider-Service Junction ---');
    console.table(junction.rows);

    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
