import pg from 'pg';
const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function migrate() {
  try {
    console.log('Connecting to Supabase...');

    await client.query(`
      ALTER TABLE public.cars 
        ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 5;
    `);
    
    console.log('✅ Added quantity column to cars table');
    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
