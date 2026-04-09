import pg from 'pg';

const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const client = new pg.Pool({ connectionString });

async function migrate() {
  try {
    console.log('Connecting to Supabase...');

    await client.query(`
      ALTER TABLE public.site_settings 
        ADD COLUMN IF NOT EXISTS features_title TEXT DEFAULT 'Why AutoRent?',
        ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ Columns added: features_title, features');

    // Also seed the default data right away
    const defaultFeatures = [
      { id: 'insured', title: 'Fully Insured', desc: 'Every rental comes with comprehensive premium insurance. Focus on the thrill while we handle the rest.', points: ['Multi-million liability', 'Zero deductible', 'Roadside assistance'], color: 'from-green-400/20', mock_id: 'insured', image_url: '', reverse: false },
      { id: 'concierge', title: '24/7 Concierge', desc: 'From restaurant reservations to vehicle swaps, our team is your silent partner on the road.', points: ['Live Chat Interface', 'Itinerary Planning', 'Emergency Response'], color: 'from-blue-400/20', mock_id: 'concierge', reverse: true, image_url: '' },
      { id: 'pricing', title: 'Transparent Pricing', desc: 'No hidden fees. Taxes, delivery, and full-tank options are revealed from the first click.', points: ['All-in pricing', 'Real-time tax calculation', 'Secure crypto-payments'], color: 'from-emerald-400/20', mock_id: 'pricing', image_url: '', reverse: false },
      { id: 'delivery', title: 'Doorstep Delivery', desc: 'We bring the experience to you. Track your vehicle in real-time as it arrives. Detailed, fueled, and ready.', points: ['Real-time Tracking', 'Valet Delivery', 'Airport Collection'], color: 'from-orange-400/20', mock_id: 'delivery', reverse: true, image_url: '' },
      { id: 'perks', title: 'Exclusive Perks', desc: 'Joining AutoRent unlocks a world of racing events, private releases, and tiered rewards for loyal drivers.', points: ['VIP Track Days', 'Racing Events', 'Tiered Rewards'], color: 'from-purple-500/20', mock_id: 'perks', image_url: '', reverse: false },
      { id: 'fleet', title: 'The Boutique Fleet', desc: "We don't do mass market. Every vehicle is a masterwork, specifically chosen for its character and feedback.", points: ['Hand-picked Selection', 'Concours Condition', 'Exotic Performance'], color: 'from-yellow-400/20', mock_id: 'fleet', reverse: true, image_url: '' },
    ];

    await client.query(`
      UPDATE public.site_settings 
      SET features_title = $1, features = $2::jsonb
      WHERE id = 'landing_page'
    `, ['Why AutoRent?', JSON.stringify(defaultFeatures)]);

    console.log('✅ Default features seeded into database');
    console.log('🎉 Migration complete! You can now save feature edits from the dashboard.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
