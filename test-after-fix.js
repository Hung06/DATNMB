const axios = require('axios');

const BASE_URL = 'https://backend-9biogey8u-hungs-projects-420012d8.vercel.app';

async function testAfterFix() {
  try {
    console.log('🔍 Testing data after fix...\n');
    
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'user1@gmail.com',
      password: '123456'
    });
    
    if (loginResponse.data.status === 'ok') {
      const userId = loginResponse.data.data.user.id;
      console.log('✅ Login successful, user_id:', userId);
      
      // 2. Test reservations API
      console.log('\n📋 Testing reservations API...');
      const reservationsResponse = await axios.get(`${BASE_URL}/api/reservations?userId=${userId}`);
      
      if (reservationsResponse.data.status === 'ok') {
        const i002Reservation = reservationsResponse.data.data.find(r => 
          r.parking_spot?.spot_number === 'I002'
        );
        
        if (i002Reservation) {
          console.log('✅ I002 Reservation Data:');
          console.log('   - ID:', i002Reservation.id);
          console.log('   - Status:', i002Reservation.status);
          console.log('   - Payment Amount:', i002Reservation.payment_amount, 'VNĐ');
          console.log('   - Payment Time:', i002Reservation.payment_time || 'NULL');
          console.log('   - Payment Method:', i002Reservation.payment_method || 'None');
          
          // Check if fix was successful
          const isFixed = i002Reservation.payment_amount === 8000 && 
                         i002Reservation.status === 'confirmed';
          
          if (isFixed) {
            console.log('🎉 SUCCESS: Data fixed correctly!');
          } else {
            console.log('❌ FAILED: Data still needs fixing');
            console.log('   - Expected payment_amount: 8000, Got:', i002Reservation.payment_amount);
            console.log('   - Expected status: confirmed, Got:', i002Reservation.status);
          }
        } else {
          console.log('❌ I002 reservation not found');
        }
      }
      
      // 3. Test history API
      console.log('\n📜 Testing history API...');
      const historyResponse = await axios.get(`${BASE_URL}/api/user/history?userId=${userId}`);
      
      if (historyResponse.data.status === 'ok') {
        const i002History = historyResponse.data.data.combined_history.find(item => 
          item.type === 'reservation' && item.parking_spot?.spot_number === 'I002'
        );
        
        if (i002History) {
          console.log('✅ I002 History Data:');
          console.log('   - ID:', i002History.id);
          console.log('   - Type:', i002History.type);
          console.log('   - Status:', i002History.status);
          console.log('   - Payment Amount:', i002History.payment_amount, 'VNĐ');
          console.log('   - Payment Time:', i002History.payment_time || 'NULL');
          console.log('   - Reserved At:', i002History.reserved_at);
          
          // Check if history shows correct data
          const historyCorrect = i002History.payment_amount === 8000;
          
          if (historyCorrect) {
            console.log('🎉 SUCCESS: History shows correct data!');
          } else {
            console.log('❌ FAILED: History still shows incorrect data');
            console.log('   - Expected payment_amount: 8000, Got:', i002History.payment_amount);
          }
        } else {
          console.log('❌ I002 not found in history');
        }
      }
      
      // 4. Summary
      console.log('\n📊 SUMMARY:');
      console.log('==========================================');
      
      const reservationFixed = i002Reservation && 
                              i002Reservation.payment_amount === 8000 && 
                              i002Reservation.status === 'confirmed';
      
      const historyFixed = i002History && 
                          i002History.payment_amount === 8000;
      
      if (reservationFixed && historyFixed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('   - Database: ✅ Fixed');
        console.log('   - History API: ✅ Fixed');
        console.log('   - App should now show correct data');
      } else if (reservationFixed && !historyFixed) {
        console.log('⚠️  PARTIAL SUCCESS');
        console.log('   - Database: ✅ Fixed');
        console.log('   - History API: ❌ Still shows wrong data');
        console.log('   - Need to check history API logic');
      } else if (!reservationFixed && historyFixed) {
        console.log('⚠️  PARTIAL SUCCESS');
        console.log('   - Database: ❌ Still needs fixing');
        console.log('   - History API: ✅ Shows correct data');
        console.log('   - Need to fix database first');
      } else {
        console.log('❌ ALL TESTS FAILED');
        console.log('   - Database: ❌ Needs fixing');
        console.log('   - History API: ❌ Shows wrong data');
        console.log('   - Please run the manual fix instructions');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAfterFix();
