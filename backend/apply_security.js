import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function applySecurity() {
  try {
    console.log('Connecting to Supabase to apply security policies...');
    const sql = fs.readFileSync(path.join(__dirname, 'security_rls.sql'), 'utf8');
    
    await client.query(sql);
    console.log('✅ Row Level Security (RLS) policies applied successfully.');
    console.log('🎉 Database is now locked down.');
  } catch (err) {
    console.error('❌ Security migration failed:', err.message);
  } finally {
    await client.end();
  }
}

applySecurity();
