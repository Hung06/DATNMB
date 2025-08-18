const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure and data...\n');

    // 1. Kiểm tra bảng users
    console.log('📋 TABLE: users');
    console.log('='.repeat(50));
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log('📊 Sample user data:');
        console.log(JSON.stringify(users[0], null, 2));
      }
    }
    console.log('');

    // 2. Kiểm tra bảng parking_lots
    console.log('📋 TABLE: parking_lots');
    console.log('='.repeat(50));
    const { data: parkingLots, error: lotsError } = await supabase
      .from('parking_lots')
      .select('*');

    if (lotsError) {
      console.error('❌ Error fetching parking_lots:', lotsError);
    } else {
      console.log(`✅ Found ${parkingLots?.length || 0} parking lots`);
      if (parkingLots && parkingLots.length > 0) {
        console.log('📊 Sample parking lot data:');
        console.log(JSON.stringify(parkingLots[0], null, 2));
      }
    }
    console.log('');

    // 3. Kiểm tra bảng parking_spots
    console.log('📋 TABLE: parking_spots');
    console.log('='.repeat(50));
    const { data: parkingSpots, error: spotsError } = await supabase
      .from('parking_spots')
      .select('*')
      .limit(5);

    if (spotsError) {
      console.error('❌ Error fetching parking_spots:', spotsError);
    } else {
      console.log(`✅ Found ${parkingSpots?.length || 0} parking spots`);
      if (parkingSpots && parkingSpots.length > 0) {
        console.log('📊 Sample parking spot data:');
        console.log(JSON.stringify(parkingSpots[0], null, 2));
      }
    }
    console.log('');

    // 4. Kiểm tra bảng parking_logs
    console.log('📋 TABLE: parking_logs');
    console.log('='.repeat(50));
    const { data: parkingLogs, error: logsError } = await supabase
      .from('parking_logs')
      .select('*')
      .order('entry_time', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('❌ Error fetching parking_logs:', logsError);
    } else {
      console.log(`✅ Found ${parkingLogs?.length || 0} parking logs`);
      if (parkingLogs && parkingLogs.length > 0) {
        console.log('📊 Recent parking logs:');
        parkingLogs.forEach((log, index) => {
          console.log(`${index + 1}. Log ID: ${log.log_id}, User: ${log.user_id}, Status: ${log.status}, Entry: ${log.entry_time}, Exit: ${log.exit_time}, Fee: ${log.fee}`);
          if (log.payment_status !== undefined) {
            console.log(`   Payment Status: ${log.payment_status}, Payment Time: ${log.payment_time}`);
          } else {
            console.log(`   Payment Status: NOT EXISTS`);
          }
        });
      }
    }
    console.log('');

    // 5. Kiểm tra bảng reservations
    console.log('📋 TABLE: reservations');
    console.log('='.repeat(50));
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .order('reserved_at', { ascending: false })
      .limit(10);

    if (reservationsError) {
      console.error('❌ Error fetching reservations:', reservationsError);
    } else {
      console.log(`✅ Found ${reservations?.length || 0} reservations`);
      if (reservations && reservations.length > 0) {
        console.log('📊 Recent reservations:');
        reservations.forEach((reservation, index) => {
          console.log(`${index + 1}. Reservation ID: ${reservation.reservation_id}, User: ${reservation.user_id}, Status: ${reservation.status}, Reserved: ${reservation.reserved_at}`);
        });
      }
    }
    console.log('');

    // 6. Kiểm tra cấu trúc bảng parking_logs chi tiết
    console.log('🔍 DETAILED STRUCTURE: parking_logs');
    console.log('='.repeat(50));
    
    // Thử select tất cả cột để xem cấu trúc
    const { data: sampleLog, error: structureError } = await supabase
      .from('parking_logs')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('❌ Error checking structure:', structureError);
    } else if (sampleLog && sampleLog.length > 0) {
      console.log('📊 Available columns in parking_logs:');
      Object.keys(sampleLog[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof sampleLog[0][column]}`);
      });
    }

    // 7. Kiểm tra dữ liệu user1@gmail.com cụ thể
    console.log('\n🔍 SPECIFIC USER DATA: user1@gmail.com');
    console.log('='.repeat(50));
    
    // Tìm user_id của user1@gmail.com
    const { data: user1, error: user1Error } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .eq('email', 'user1@gmail.com')
      .single();

    if (user1Error) {
      console.error('❌ Error finding user1:', user1Error);
    } else if (user1) {
      console.log(`✅ Found user1: ${JSON.stringify(user1)}`);
      
      // Lấy parking logs của user1
      const { data: user1Logs, error: user1LogsError } = await supabase
        .from('parking_logs')
        .select('*')
        .eq('user_id', user1.user_id)
        .order('entry_time', { ascending: false });

      if (user1LogsError) {
        console.error('❌ Error fetching user1 logs:', user1LogsError);
      } else {
        console.log(`📊 User1 has ${user1Logs?.length || 0} parking logs:`);
        if (user1Logs && user1Logs.length > 0) {
          user1Logs.forEach((log, index) => {
            console.log(`${index + 1}. Log ID: ${log.log_id}, Status: ${log.status}, Entry: ${log.entry_time}, Exit: ${log.exit_time}, Fee: ${log.fee}`);
            if (log.payment_status !== undefined) {
              console.log(`   Payment Status: ${log.payment_status}, Payment Time: ${log.payment_time}`);
            } else {
              console.log(`   Payment Status: COLUMN NOT EXISTS`);
            }
          });
        }
      }
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkDatabaseStructure();
