import pg from 'pg';
const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function migrate() {
  try {
    console.log('Connecting to Supabase...');

    await client.query(`
      ALTER TABLE public.site_settings 
        ADD COLUMN IF NOT EXISTS heritage_image TEXT DEFAULT 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2070&auto=format&fit=crop';
    `);
    console.log('✅ heritage_image column added to site_settings');
    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
