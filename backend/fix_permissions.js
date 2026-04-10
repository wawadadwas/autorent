import pg from 'pg';
import fs from 'fs';

const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function run() {
  try {
    const sql = fs.readFileSync('backend/fix_permissions.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Permissions fixed');
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    await client.end();
  }
}

run();
