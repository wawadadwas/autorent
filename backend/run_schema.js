import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new pg.Pool({
  connectionString,
});

async function runSchema() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../setup_schema.sql'), 'utf-8');
    console.log('Connecting to Supabase PostgreSQL database...');
    
    // Execute the schema
    await client.query(schemaSql);
    
    console.log('Successfully created tables and inserted dummy data!');
  } catch (err) {
    console.error('Error executing schema:', err.message);
  } finally {
    await client.end();
  }
}

runSchema();
