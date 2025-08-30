const axios = require('axios');

const BASE_URL = 'https://backend-9biogey8u-hungs-projects-420012d8.vercel.app';

async function inspectAllTables() {
  try {
    console.log('🔍 INSPECTING ALL TABLES AND DATA...\n');
    
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'user1@gmail.com',
      password: '123456'
    });
    
    if (loginResponse.data.status === 'ok') {
      const userId = loginResponse.data.data.user.id;
      console.log('✅ Login successful, user_id:', userId);
      
      // 2. INSPECT USERS TABLE
      console.log('\n👥 ==========================================');
      console.log('👥 USERS TABLE');
      console.log('==========================================');
      const usersResponse = await axios.get(`${BASE_URL}/api/users`);
      if (usersResponse.data.status === 'ok') {
        const users = usersResponse.data.data;
        console.log(`✅ Found ${users.length} users:\n`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. User ID: ${user.id}`);
          console.log(`   - Email: ${user.email}`);
          console.log(`   - Name: ${user.name || 'N/A'}`);
          console.log(`   - Phone: ${user.phone || 'N/A'}`);
          console.log(`   - Created At: ${user.created_at}`);
          console.log(`   - Updated At: ${user.updated_at}`);
          console.log('');
        });
      }
      
      // 3. INSPECT PARKING LOTS TABLE
      console.log('\n🏢 ==========================================');
      console.log('🏢 PARKING LOTS TABLE');
      console.log('==========================================');
      const parkingLotsResponse = await axios.get(`${BASE_URL}/api/parking-lots`);
      if (parkingLotsResponse.data.status === 'ok') {
        const parkingLots = parkingLotsResponse.data.data;
        console.log(`✅ Found ${parkingLots.length} parking lots:\n`);
        parkingLots.forEach((lot, index) => {
          console.log(`${index + 1}. Parking Lot ID: ${lot.id}`);
          console.log(`   - Name: ${lot.name}`);
          console.log(`   - Address: ${lot.address}`);
          console.log(`   - Price per hour: ${lot.pricePerHour} VNĐ`);
          console.log(`   - Total spots: ${lot.totalSpots}`);
          console.log(`   - Available spots: ${lot.availableSpots}`);
          console.log(`   - Latitude: ${lot.latitude}`);
          console.log(`   - Longitude: ${lot.longitude}`);
          console.log(`   - Created At: ${lot.created_at || 'N/A'}`);
          console.log(`   - Updated At: ${lot.updated_at || 'N/A'}`);
          console.log('');
        });
      }
      
      // 4. INSPECT PARKING SPOTS TABLE
      console.log('\n🚗 ==========================================');
      console.log('🚗 PARKING SPOTS TABLE');
      console.log('==========================================');
      
      // Lấy spots của từng lot
      for (const lot of parkingLotsResponse.data.data) {
        console.log(`\n📍 Spots for Parking Lot "${lot.name}" (ID: ${lot.id}):`);
        const spotsResponse = await axios.get(`${BASE_URL}/api/parking-lots/${lot.id}/spots`);
        
        if (spotsResponse.data.status === 'ok') {
          const spots = spotsResponse.data.data;
          console.log(`   Found ${spots.length} spots:`);
          
          spots.forEach(spot => {
            console.log(`   - Spot ID: ${spot.spotId || spot.id}`);
            console.log(`     * Spot Number: ${spot.spotNumber}`);
            console.log(`     * Lot ID: ${spot.lotId || spot.lot_id}`);
            console.log(`     * Type: ${spot.spotType || 'standard'}`);
            console.log(`     * Is Occupied: ${spot.isOccupied ? 'Yes' : 'No'}`);
            console.log(`     * Is Reserved: ${spot.isReserved ? 'Yes' : 'No'}`);
            console.log(`     * Reserved By: ${spot.reservedBy || 'None'}`);
            console.log(`     * Created At: ${spot.createdAt || 'N/A'}`);
            console.log(`     * Updated At: ${spot.updatedAt || 'N/A'}`);
          });
        }
      }
      
      // 5. INSPECT RESERVATIONS TABLE
      console.log('\n📋 ==========================================');
      console.log('📋 RESERVATIONS TABLE');
      console.log('==========================================');
      const reservationsResponse = await axios.get(`${BASE_URL}/api/reservations?userId=${userId}`);
      
      if (reservationsResponse.data.status === 'ok') {
        const reservations = reservationsResponse.data.data;
        console.log(`✅ Found ${reservations.length} reservations:\n`);
        
        reservations.forEach((reservation, index) => {
          console.log(`${index + 1}. Reservation ID: ${reservation.id}`);
          console.log(`   - User ID: ${reservation.user_id}`);
          console.log(`   - Spot ID: ${reservation.spot_id}`);
          console.log(`   - Spot Number: ${reservation.parking_spot?.spot_number}`);
          console.log(`   - Parking Lot: ${reservation.parking_spot?.parking_lot?.name}`);
          console.log(`   - Status: ${reservation.status}`);
          console.log(`   - Payment Amount: ${reservation.payment_amount} VNĐ`);
          console.log(`   - Payment Method: ${reservation.payment_method || 'None'}`);
          console.log(`   - Payment Time: ${reservation.payment_time || 'NULL'}`);
          console.log(`   - Reserved At: ${reservation.reserved_at}`);
          console.log(`   - Expected Start: ${reservation.expected_start}`);
          console.log(`   - Expected End: ${reservation.expected_end}`);
          console.log(`   - Created At: ${reservation.created_at || 'N/A'}`);
          console.log(`   - Updated At: ${reservation.updated_at || 'N/A'}`);
          console.log('');
        });
      }
      
      // 6. INSPECT PARKING LOGS TABLE
      console.log('\n📝 ==========================================');
      console.log('📝 PARKING LOGS TABLE');
      console.log('==========================================');
      const parkingLogsResponse = await axios.get(`${BASE_URL}/api/parking-logs/history`);
      
      if (parkingLogsResponse.data.status === 'ok') {
        const parkingLogs = parkingLogsResponse.data.data;
        console.log(`✅ Found ${parkingLogs.length} parking logs:\n`);
        
        // Chỉ hiển thị 10 logs đầu tiên để tránh quá dài
        parkingLogs.slice(0, 10).forEach((log, index) => {
          console.log(`${index + 1}. Log ID: ${log.log_id || log.id}`);
          console.log(`   - User ID: ${log.user_id}`);
          console.log(`   - Spot ID: ${log.spot_id}`);
          console.log(`   - Spot Number: ${log.spot_number}`);
          console.log(`   - Parking Lot: ${log.parking_lot_name}`);
          console.log(`   - Status: ${log.status}`);
          console.log(`   - Entry Time: ${log.entry_time}`);
          console.log(`   - Exit Time: ${log.exit_time || 'Still parking'}`);
          console.log(`   - Total Minutes: ${log.total_minutes || 'N/A'}`);
          console.log(`   - Fee: ${log.fee} VNĐ`);
          console.log(`   - Payment Status: ${log.payment_status || 'N/A'}`);
          console.log(`   - Payment Time: ${log.payment_time || 'N/A'}`);
          console.log(`   - Created At: ${log.created_at || 'N/A'}`);
          console.log(`   - Updated At: ${log.updated_at || 'N/A'}`);
          console.log('');
        });
        
        if (parkingLogs.length > 10) {
          console.log(`... and ${parkingLogs.length - 10} more logs`);
        }
      }
      
      // 7. INSPECT USER HISTORY (COMBINED)
      console.log('\n📜 ==========================================');
      console.log('📜 USER HISTORY (COMBINED)');
      console.log('==========================================');
      const historyResponse = await axios.get(`${BASE_URL}/api/user/history?userId=${userId}`);
      
      if (historyResponse.data.status === 'ok') {
        const history = historyResponse.data.data.combined_history;
        console.log(`✅ Found ${history.length} history items:\n`);
        
        history.forEach((item, index) => {
          console.log(`${index + 1}. ${item.type.toUpperCase()} - ID: ${item.id}`);
          console.log(`   - Type: ${item.type}`);
          console.log(`   - Status: ${item.status}`);
          console.log(`   - Spot Number: ${item.spot_number}`);
          console.log(`   - Parking Lot: ${item.parking_lot?.name || 'N/A'}`);
          
          if (item.type === 'reservation') {
            console.log(`   - Payment Amount: ${item.payment_amount} VNĐ`);
            console.log(`   - Reserved At: ${item.reserved_at}`);
            console.log(`   - Payment Time: ${item.payment_time || 'NULL'}`);
            console.log(`   - Expected Start: ${item.expected_start || 'N/A'}`);
            console.log(`   - Expected End: ${item.expected_end || 'N/A'}`);
          } else {
            console.log(`   - Fee: ${item.fee} VNĐ`);
            console.log(`   - Entry Time: ${item.entry_time}`);
            console.log(`   - Exit Time: ${item.exit_time || 'Still parking'}`);
            console.log(`   - Total Minutes: ${item.total_minutes || 'N/A'}`);
            console.log(`   - Payment Status: ${item.payment_status || 'N/A'}`);
          }
          console.log('');
        });
      }
      
      // 8. ANALYSIS FOR I002
      console.log('\n🔍 ==========================================');
      console.log('🔍 DETAILED ANALYSIS FOR I002');
      console.log('==========================================');
      
      const i002Reservation = reservationsResponse.data.data.find(r => 
        r.parking_spot?.spot_number === 'I002'
      );
      
      const i002History = historyResponse.data.data.combined_history.find(item => 
        item.type === 'reservation' && item.spot_number === 'I002'
      );
      
      if (i002Reservation) {
        console.log('📊 RESERVATION TABLE DATA:');
        console.log('   - ID:', i002Reservation.id);
        console.log('   - User ID:', i002Reservation.user_id);
        console.log('   - Spot ID:', i002Reservation.spot_id);
        console.log('   - Status:', i002Reservation.status);
        console.log('   - Payment Amount:', i002Reservation.payment_amount, 'VNĐ');
        console.log('   - Payment Method:', i002Reservation.payment_method || 'None');
        console.log('   - Payment Time:', i002Reservation.payment_time || 'NULL');
        console.log('   - Reserved At:', i002Reservation.reserved_at);
        console.log('');
      }
      
      if (i002History) {
        console.log('📊 HISTORY API DATA:');
        console.log('   - ID:', i002History.id);
        console.log('   - Type:', i002History.type);
        console.log('   - Status:', i002History.status);
        console.log('   - Payment Amount:', i002History.payment_amount, 'VNĐ');
        console.log('   - Payment Time:', i002History.payment_time || 'NULL');
        console.log('   - Reserved At:', i002History.reserved_at);
        console.log('');
      }
      
      // 9. COMPARISON
      console.log('🔍 COMPARISON:');
      console.log('==========================================');
      if (i002Reservation && i002History) {
        console.log('Database vs History API:');
        console.log(`   - Status: ${i002Reservation.status} vs ${i002History.status}`);
        console.log(`   - Payment Amount: ${i002Reservation.payment_amount} vs ${i002History.payment_amount}`);
        console.log(`   - Payment Time: ${i002Reservation.payment_time || 'NULL'} vs ${i002History.payment_time || 'NULL'}`);
        
        console.log('\n❌ DISCREPANCIES:');
        if (i002Reservation.status !== i002History.status) {
          console.log(`   - Status mismatch: Database=${i002Reservation.status}, History=${i002History.status}`);
        }
        if (i002Reservation.payment_amount !== i002History.payment_amount) {
          console.log(`   - Payment amount mismatch: Database=${i002Reservation.payment_amount}, History=${i002History.payment_amount}`);
        }
        if (i002Reservation.payment_time !== i002History.payment_time) {
          console.log(`   - Payment time mismatch: Database=${i002Reservation.payment_time || 'NULL'}, History=${i002History.payment_time || 'NULL'}`);
        }
        
        console.log('\n🔧 REQUIRED FIX:');
        console.log('==========================================');
        console.log(`UPDATE reservations`);
        console.log(`SET`);
        console.log(`  payment_amount = 8000,`);
        console.log(`  status = 'confirmed',`);
        console.log(`  payment_method = 'manual_fix',`);
        console.log(`  payment_time = NOW()`);
        console.log(`WHERE reservation_id = ${i002Reservation.id};`);
        console.log('==========================================');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

inspectAllTables();
