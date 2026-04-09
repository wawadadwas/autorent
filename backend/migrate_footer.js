import pg from 'pg';
const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function migrate() {
  try {
    console.log('Connecting to Supabase...');

    await client.query(`
      ALTER TABLE public.site_settings 
        ADD COLUMN IF NOT EXISTS footer_email TEXT DEFAULT 'romel.developer@gmail.com',
        ADD COLUMN IF NOT EXISTS footer_phone TEXT DEFAULT '+63 912 345 6789',
        ADD COLUMN IF NOT EXISTS footer_location TEXT DEFAULT 'Manila, Philippines',
        ADD COLUMN IF NOT EXISTS footer_socials JSONB DEFAULT '[
          {"name": "Instagram", "url": "#"},
          {"name": "Facebook", "url": "#"},
          {"name": "Twitter", "url": "#"},
          {"name": "LinkedIn", "url": "#"}
        ]'::jsonb;
    `);
    console.log('✅ Footer columns added to site_settings');

    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
