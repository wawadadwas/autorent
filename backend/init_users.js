import { supabaseAdmin } from './supabaseClient.js';

const USERS_TO_CREATE = [
  {
    email: 'admin@autorent.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'employee@autorent.com',
    password: 'employee123',
    role: 'employee'
  }
];

async function initUsers() {
  console.log('--- Initializing Users via Supabase Admin API ---');

  for (const userData of USERS_TO_CREATE) {
    console.log(`Processing ${userData.email}...`);

    // 1. Create the user in Auth
    const { data: userRecord, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true // Mark as confirmed immediately to bypass Gmail for the first setup
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`> User ${userData.email} already exists in Auth.`);
      } else {
        console.error(`> Error creating ${userData.email}:`, authError.message);
        continue;
      }
    } else {
      console.log(`> Successfully created Auth record for ${userData.email}`);
    }

    // 2. Fetch the ID (either from create call or manual lookup)
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === userData.email);

    if (existingUser) {
      // 3. Update the role in profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: existingUser.id, 
          email: userData.email, 
          role: userData.role 
        });

      if (profileError) {
        console.error(`> Error setting role for ${userData.email}:`, profileError.message);
      } else {
        console.log(`> Role [${userData.role}] assigned to ${userData.email}`);
      }
    }
  }

  console.log('------------------------------------------------');
}

initUsers();
