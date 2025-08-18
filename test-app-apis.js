// Test All APIs in app.js
const https = require('https');

const API_URL = 'https://backend-1igq38tw2-hungs-projects-420012d8.vercel.app';

function testAPI(endpoint, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const url = `${API_URL}${endpoint}`;
    const options = {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', () => resolve({ status: 0, data: 'Network Error' }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAllAPIs() {
  console.log('🔍 TESTING ALL APIs IN APP.JS\n');
  
  // Test 1: Health check
  console.log('1. Testing health check:');
  const health = await testAPI('/api/health');
  console.log(`   Status: ${health.status}`);
  console.log(`   Database: ${health.data?.database}`);
  console.log(`   ✅ ${health.data?.database === 'Connected to Supabase' ? 'SUPABASE CONNECTED' : 'NOT CONNECTED'}\n`);
  
  // Test 2: Parking lots
  console.log('2. Testing parking lots:');
  const parkingLots = await testAPI('/api/parking-lots');
  console.log(`   Status: ${parkingLots.status}`);
  console.log(`   Message: ${parkingLots.data?.message}`);
  console.log(`   Data count: ${parkingLots.data?.data?.length || 0}`);
  if (parkingLots.data?.data?.length > 0) {
    console.log(`   First lot: ${parkingLots.data.data[0].name}`);
    console.log(`   Available spots: ${parkingLots.data.data[0].availableSpots}`);
    console.log(`   Price per hour: ${parkingLots.data.data[0].pricePerHour}`);
  }
  console.log(`   ✅ ${parkingLots.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  // Test 3: Parking lot by ID
  console.log('3. Testing parking lot by ID:');
  const parkingLot = await testAPI('/api/parking-lots/1');
  console.log(`   Status: ${parkingLot.status}`);
  console.log(`   Message: ${parkingLot.data?.message}`);
  if (parkingLot.data?.data) {
    console.log(`   Lot: ${parkingLot.data.data.name}`);
    console.log(`   Address: ${parkingLot.data.data.address}`);
  }
  console.log(`   ✅ ${parkingLot.data?.message?.includes('retrieved') ? 'SUCCESS' : 'ERROR'}\n`);
  
  // Test 4: Parking spots for lot
  console.log('4. Testing parking spots for lot:');
  const parkingSpots = await testAPI('/api/parking-lots/1/spots');
  console.log(`   Status: ${parkingSpots.status}`);
  console.log(`   Message: ${parkingSpots.data?.message}`);
  console.log(`   Data count: ${parkingSpots.data?.data?.length || 0}`);
  console.log(`   ✅ ${parkingSpots.data?.message?.includes('retrieved') ? 'SUCCESS' : 'ERROR'}\n`);
  
  // Test 5: All parking spots
  console.log('5. Testing all parking spots:');
  const allSpots = await testAPI('/api/parking-spots');
  console.log(`   Status: ${allSpots.status}`);
  console.log(`   Message: ${allSpots.data?.message}`);
  console.log(`   Data count: ${allSpots.data?.data?.length || 0}`);
  console.log(`   ✅ ${allSpots.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  // Test 6: Available parking spots
  console.log('6. Testing available parking spots:');
  const availableSpots = await testAPI('/api/parking-spots/available');
  console.log(`   Status: ${availableSpots.status}`);
  console.log(`   Message: ${availableSpots.data?.message}`);
  console.log(`   Data count: ${availableSpots.data?.data?.length || 0}`);
  console.log(`   ✅ ${availableSpots.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  // Test 7: Login
  console.log('7. Testing login:');
  const login = await testAPI('/api/auth/login', 'POST', {
    email: 'nhorang693@gmail.com',
    password: '1'
  });
  console.log(`   Status: ${login.status}`);
  console.log(`   Message: ${login.data?.message}`);
  if (login.data?.data?.user) {
    console.log(`   User: ${login.data.data.user.name} (${login.data.data.user.email})`);
  }
  console.log(`   ✅ ${login.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  // Test 8: Google Auth
  console.log('8. Testing Google Auth:');
  const googleAuth = await testAPI('/api/auth/google', 'POST', {
    idToken: 'test-token',
    email: 'nhorang693@gmail.com'
  });
  console.log(`   Status: ${googleAuth.status}`);
  console.log(`   Message: ${googleAuth.data?.message}`);
  if (googleAuth.data?.user) {
    console.log(`   User: ${googleAuth.data.user.full_name} (${googleAuth.data.user.email})`);
  }
  console.log(`   ✅ ${googleAuth.data?.message?.includes('thành công') ? 'SUCCESS' : 'ERROR'}\n`);
  
  // Test 9: Register
  console.log('9. Testing register:');
  const register = await testAPI('/api/auth/register', 'POST', {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    phone: '0123456789',
    license_plate: 'TEST123'
  });
  console.log(`   Status: ${register.status}`);
  console.log(`   Message: ${register.data?.message}`);
  console.log(`   ✅ ${register.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  // Test 10: Profile
  console.log('10. Testing profile:');
  const profile = await testAPI('/api/auth/profile?email=nhorang693@gmail.com');
  console.log(`   Status: ${profile.status}`);
  console.log(`   Message: ${profile.data?.message}`);
  if (profile.data?.data?.user) {
    console.log(`   User: ${profile.data.data.user.full_name} (${profile.data.data.user.email})`);
    console.log(`   Phone: ${profile.data.data.user.phone || 'null'}`);
    console.log(`   License: ${profile.data.data.user.license_plate || 'null'}`);
  }
  console.log(`   ✅ ${profile.data?.message?.includes('successfully') ? 'SUCCESS' : 'ERROR'}\n`);
  
  // Test 11: Update Profile
  console.log('11. Testing update profile:');
  const updateProfile = await testAPI('/api/auth/profile', 'PUT', {
    full_name: 'Updated Name',
    phone: '0987654321',
    license_plate: 'UPDATED123',
    email: 'nhorang693@gmail.com'
  });
  console.log(`   Status: ${updateProfile.status}`);
  console.log(`   Message: ${updateProfile.data?.message}`);
  console.log(`   ✅ ${updateProfile.data?.message?.includes('successfully') ? 'SUCCESS' : 'ERROR'}\n`);
  
  // Test 12: Reservations
  console.log('12. Testing reservations:');
  const reservations = await testAPI('/api/reservations?email=nhorang693@gmail.com');
  console.log(`   Status: ${reservations.status}`);
  console.log(`   Message: ${reservations.data?.message}`);
  console.log(`   Data count: ${reservations.data?.data?.length || 0}`);
  console.log(`   ✅ ${reservations.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  // Test 13: Parking Logs History
  console.log('13. Testing parking logs history:');
  const parkingLogs = await testAPI('/api/parking-logs/history?email=nhorang693@gmail.com');
  console.log(`   Status: ${parkingLogs.status}`);
  console.log(`   Message: ${parkingLogs.data?.message}`);
  console.log(`   Data count: ${parkingLogs.data?.data?.length || 0}`);
  console.log(`   ✅ ${parkingLogs.data?.message?.includes('real data') ? 'REAL DATA' : 'ERROR'}\n`);
  
  console.log('🎯 ALL APIs TEST COMPLETE');
  console.log('📋 Summary:');
  console.log('   - All APIs should return real data from Supabase');
  console.log('   - No mock data should be returned');
  console.log('   - Database connection should be active');
  console.log('');
  console.log('🌐 Backend URL:', API_URL);
}

testAllAPIs();
