const { Client } = require('pg');
const client = new Client({
  host: 'localhost', port: 5432, user: 'postgres', password: 'malakmss2004', database: 'family_care',
});

async function seed() {
  try {
    await client.connect();
    console.log('Seeding categories...');
    const catRes = await client.query("INSERT INTO service_category (name, icon) VALUES ('Elderly Care', '👴'), ('Childcare', '👶'), ('Medical Care', '🏥'), ('Home Help', '🏠') RETURNING id_c, name");
    const cats = catRes.rows;

    // Use id_c (lowercase returned by postgres usually unless quoted)
    const getCatId = (name) => cats.find(c => c.name === name).id_c;

    const elderId = getCatId('Elderly Care');
    const childId = getCatId('Childcare');
    const medId = getCatId('Medical Care');
    const homeId = getCatId('Home Help');

    console.log('Seeding services...');
    const services = [
      ['Home Visit Physician', 'Professional medical consultation at home', 50.00, medId],
      ['Babysitting', 'Reliable childcare for your little ones', 25.00, childId],
      ['Elderly Companionship', 'Caring support for seniors', 30.00, elderId],
      ['House Cleaning', 'Keep your home spotless', 20.00, homeId],
      ['Elderly Nursing', 'Specialized nursing care for seniors', 45.00, elderId]
    ];

    for (const s of services) {
        await client.query("INSERT INTO service (name, description, base_price, id_C) VALUES ($1, $2, $3, $4)", s);
    }

    console.log('Seeding completed successfully!');
    await client.end();
  } catch (err) {
    console.error(err);
    await client.end();
    process.exit(1);
  }
}
seed();
