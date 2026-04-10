import { supabaseAdmin } from './supabaseClient.js';

async function confirmAllUsers() {
  console.log('🔍 Fetching users to confirm...');
  
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error fetching users:', error.message);
    return;
  }

  for (const user of users) {
    if (!user.email_confirmed_at) {
      console.log(`⚡ Confirming user: ${user.email}...`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.error(`❌ Failed to confirm ${user.email}:`, updateError.message);
      } else {
        console.log(`✅ ${user.email} confirmed!`);
      }
    }
  }
  
  console.log('🏁 Process complete.');
}

confirmAllUsers();
