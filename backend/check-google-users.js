const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.supabase' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkGoogleUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Kiểm tra user test-google-user@gmail.com
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('user_id, email, full_name, created_at')
      .eq('email', 'test-google-user@gmail.com');

    if (testError) {
      console.error('Error checking test user:', testError);
      return;
    }

    if (testUser && testUser.length > 0) {
      console.log('❌ Found test user:', testUser[0]);
      console.log('This user was created with the old fallback email');
      
      // Hỏi user có muốn xóa không
      console.log('\n⚠️  To fix this issue, you can:');
      console.log('1. Delete this test user from Supabase dashboard');
      console.log('2. Or run this script with DELETE_TEST_USER=true');
      
      if (process.env.DELETE_TEST_USER === 'true') {
        console.log('🗑️  Deleting test user...');
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('email', 'test-google-user@gmail.com');
        
        if (deleteError) {
          console.error('Error deleting test user:', deleteError);
        } else {
          console.log('✅ Test user deleted successfully');
        }
      }
    } else {
      console.log('✅ No test user found');
    }

    // Kiểm tra tất cả users
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('user_id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allError) {
      console.error('Error fetching all users:', allError);
      return;
    }

    console.log('\n📊 Recent users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.full_name}) - ${user.created_at}`);
    });

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkGoogleUsers();
