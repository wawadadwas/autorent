import pg from 'pg';
const connectionString = 'postgresql://postgres.sdoizkhxzmvittpcfcae:pGWqI9aXX4kopSCa@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new pg.Pool({ connectionString });

async function checkSchema() {
  try {
    const cars = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cars'");
    const bookings = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings'");
    console.log('CARS:', JSON.stringify(cars.rows, null, 2));
    console.log('BOOKINGS:', JSON.stringify(bookings.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
checkSchema();
