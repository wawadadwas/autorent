import pg from 'pg';
const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function migrate() {
  try {
    console.log('Connecting to Supabase...');

    await client.query(`
      ALTER TABLE public.rentals 
        ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT '09:00',
        ADD COLUMN IF NOT EXISTS return_time TEXT DEFAULT '09:00',
        ADD COLUMN IF NOT EXISTS dropoff_address TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS dropoff_lat DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS dropoff_lng DOUBLE PRECISION;
    `);
    console.log('✅ Time & location columns added to rentals');
    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
