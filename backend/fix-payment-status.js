const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.supabase' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function fixPaymentStatus() {
  try {
    console.log('🔧 Fixing payment status for old parking logs...');
    
    // Tìm tất cả parking logs đã ra xe (status = 'out') nhưng chưa có payment_status
    const { data: parkingLogs, error: fetchError } = await supabase
      .from('parking_logs')
      .select('log_id, user_id, entry_time, exit_time, fee, status, payment_status, payment_time')
      .eq('status', 'out')
      .or('payment_status.is.null,payment_status.eq.pending');

    if (fetchError) {
      console.error('Error fetching parking logs:', fetchError);
      return;
    }

    console.log(`📊 Found ${parkingLogs?.length || 0} parking logs to fix`);

    if (!parkingLogs || parkingLogs.length === 0) {
      console.log('✅ No parking logs need fixing');
      return;
    }

    // Cập nhật từng parking log
    let updatedCount = 0;
    for (const log of parkingLogs) {
      console.log(`🔧 Updating log_id: ${log.log_id}, user_id: ${log.user_id}`);
      
      const { error: updateError } = await supabase
        .from('parking_logs')
        .update({
          payment_status: 'paid',
          payment_time: log.exit_time || new Date().toISOString()
        })
        .eq('log_id', log.log_id);

      if (updateError) {
        console.error(`❌ Error updating log_id ${log.log_id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`✅ Updated log_id: ${log.log_id}`);
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} parking logs`);

    // Kiểm tra kết quả
    const { data: checkLogs, error: checkError } = await supabase
      .from('parking_logs')
      .select('log_id, user_id, status, payment_status, payment_time')
      .eq('status', 'out')
      .order('exit_time', { ascending: false })
      .limit(10);

    if (checkError) {
      console.error('Error checking results:', checkError);
    } else {
      console.log('\n📋 Recent parking logs after fix:');
      checkLogs.forEach(log => {
        console.log(`- Log ${log.log_id}: User ${log.user_id}, Status: ${log.status}, Payment: ${log.payment_status}, Time: ${log.payment_time}`);
      });
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

fixPaymentStatus();
