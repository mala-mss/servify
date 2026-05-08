const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'malakmss2004',
  database: 'family_care',
});

async function runSchema() {
  try {
    await client.connect();
    console.log('Connected to database.');

    console.log('Dropping existing public schema...');
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO postgres');
    await client.query('GRANT ALL ON SCHEMA public TO public');

    const sqlPath = path.join(__dirname, 'database.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove BOM if present
    if (sql.charCodeAt(0) === 0xFEFF) {
      sql = sql.slice(1);
    }

    console.log('Applying database.sql...');
    // Split by semicolon, but be careful with functions or complex triggers if they exist
    // In this database.sql, it's mostly simple CREATE TABLE
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let statement of statements) {
      try {
        await client.query(statement);
      } catch (e) {
        console.error('Error executing statement:', statement.substring(0, 50) + '...');
        throw e;
      }
    }

    console.log('✅ Database schema updated successfully!');
    await client.end();
  } catch (err) {
    console.error('❌ Error updating database schema:', err);
    await client.end();
    process.exit(1);
  }
}

runSchema();
