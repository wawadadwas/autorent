import pg from 'pg';
const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function run() {
  try {
    await client.query('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
    console.log('✅ RLS DISABLED on profiles');
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    await client.end();
  }
}
run();
