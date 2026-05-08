const { Client } = require('pg');
const client = new Client({
  host: 'localhost', port: 5432, user: 'postgres', password: 'malakmss2004', database: 'family_care',
});

async function check() {
  try {
    await client.connect();
    const userId = 2; // Assuming this is the test user
    console.log('Checking for userId:', userId);
    
    const sql = `
      SELECT s.id_S as id_service, s.*, sc.name as category_name
      FROM service s
      JOIN providing sps ON s.id_S = sps.id_S
      LEFT JOIN service_category sc ON s.id_C = sc.id_C
      WHERE sps.idU_SP = $1
    `;
    const result = await client.query(sql, [userId]);
    console.log('QUERY RESULT ROWS:', result.rows);
    
    const providers = await client.query('SELECT * FROM service_provider WHERE idU_SP = $1', [userId]);
    console.log('PROVIDER RECORD:', providers.rows);

    await client.end();
  } catch (err) {
    console.error(err);
    await client.end();
  }
}
check();
