const axios = require('axios');

const BASE_URL = 'https://backend-mvghp1d15-hungs-projects-420012d8.vercel.app';

// Test data
const testUser = {
  email: 'hung@gmail.com',
  password: '1',
  name: 'Test User',
  phone: '0123456789',
  license_plate: '30A-12345'
};

let authToken = null;
let userId = null;
let parkingLotId = null;
let parkingSpotId = null;
let reservationId = null;

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
        } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  const result = await makeRequest('GET', '/');
  console.log('Health Check:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Response:', result.data);
  } else {
    console.log('Error:', result.error);
  }
}

async function testParkingLots() {
  console.log('\n🔍 Testing Parking Lots...');
  const result = await makeRequest('GET', '/api/parking-lots');
  console.log('Get Parking Lots:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success && result.data.data && result.data.data.length > 0) {
    parkingLotId = result.data.data[0].id;
    console.log(`Found ${result.data.data.length} parking lots`);
    console.log('First parking lot:', result.data.data[0]);
  } else {
    console.log('Error:', result.error);
  }
}

async function testParkingSpots() {
  console.log('\n🔍 Testing Parking Spots...');
  const result = await makeRequest('GET', '/api/parking-spots');
  console.log('Get Parking Spots:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success && result.data.data && result.data.data.length > 0) {
    parkingSpotId = result.data.data[0].id;
    console.log(`Found ${result.data.data.length} parking spots`);
    console.log('First parking spot:', result.data.data[0]);
  } else {
    console.log('Error:', result.error);
  }
}

async function testLogin() {
  console.log('\n🔍 Testing Login...');
  const result = await makeRequest('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  console.log('Login:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    authToken = result.data.data.token;
    userId = result.data.data.user.id;
    console.log('Login successful, user ID:', userId);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGoogleAuth() {
  console.log('\n🔍 Testing Google Auth...');
  const result = await makeRequest('POST', '/api/auth/google', {
    idToken: 'test-google-token',
    email: 'test-google-user@gmail.com'
  });
  console.log('Google Auth:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Google auth successful');
  } else {
    console.log('Error:', result.error);
  }
}

async function testRegister() {
  console.log('\n🔍 Testing Register...');
  const result = await makeRequest('POST', '/api/auth/register', {
    email: 'test-register@gmail.com',
    password: 'test123',
    name: 'Test Register User',
    phone: '0987654321',
    license_plate: '30B-54321'
  });
  console.log('Register:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Registration successful');
  } else {
    console.log('Error:', result.error);
  }
}

async function testProfile() {
  console.log('\n🔍 Testing Profile...');
  const result = await makeRequest('GET', `/api/auth/profile?email=${testUser.email}`);
  console.log('Get Profile:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Profile data:', result.data.data.user);
  } else {
    console.log('Error:', result.error);
  }
}

async function testUpdateProfile() {
  console.log('\n🔍 Testing Update Profile...');
  const result = await makeRequest('PUT', '/api/auth/profile', {
    full_name: 'Updated Test User',
    phone: '0111222333',
    license_plate: '30A-99999',
    email: testUser.email
  });
  console.log('Update Profile:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Profile updated successfully');
  } else {
    console.log('Error:', result.error);
  }
}

async function testCreateReservation() {
  if (!userId || !parkingSpotId) {
    console.log('\n⚠️ Skipping Create Reservation - missing userId or parkingSpotId');
    return;
  }
  
  console.log('\n🔍 Testing Create Reservation...');
  const startTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
  
  const result = await makeRequest('POST', '/api/reservations/create', {
    userId: userId,
    spotId: parkingSpotId,
    expectedStart: startTime,
    expectedEnd: endTime
  });
  console.log('Create Reservation:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    reservationId = result.data.data.reservation_id;
    console.log('Reservation created, ID:', reservationId);
  } else {
    console.log('Error:', result.error);
  }
}

async function testGetReservations() {
  console.log('\n🔍 Testing Get Reservations...');
  const result = await makeRequest('GET', '/api/reservations');
  console.log('Get Reservations:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log(`Found ${result.data.data.length} reservations`);
  } else {
    console.log('Error:', result.error);
  }
}

async function testPaymentInfo() {
  if (!reservationId || !userId) {
    console.log('\n⚠️ Skipping Payment Info - missing reservationId or userId');
    return;
  }
  
  console.log('\n🔍 Testing Payment Info...');
  const result = await makeRequest('GET', `/api/payment/${reservationId}?userId=${userId}`);
  console.log('Get Payment Info:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Payment info:', result.data.data);
  } else {
    console.log('Error:', result.error);
  }
}

async function testTestPayment() {
  if (!reservationId || !userId) {
    console.log('\n⚠️ Skipping Test Payment - missing reservationId or userId');
    return;
  }
  
  console.log('\n🔍 Testing Test Payment...');
  const result = await makeRequest('POST', '/api/payment/test', {
    reservationId: reservationId,
    userId: userId
  });
  console.log('Test Payment:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Test payment successful');
  } else {
    console.log('Error:', result.error);
  }
}

async function testUserHistory() {
  if (!userId) {
    console.log('\n⚠️ Skipping User History - missing userId');
    return;
  }
  
  console.log('\n🔍 Testing User History...');
  const result = await makeRequest('GET', `/api/user/history?userId=${userId}`);
  console.log('Get User History:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log(`Found ${result.data.data.reservations.length} reservations and ${result.data.data.parking_logs.length} parking logs`);
  } else {
    console.log('Error:', result.error);
  }
}

async function testParkingStatus() {
  if (!userId) {
    console.log('\n⚠️ Skipping Parking Status - missing userId');
    return;
  }
  
  console.log('\n🔍 Testing Parking Status...');
  const result = await makeRequest('GET', `/api/user/parking-status?userId=${userId}`);
  console.log('Get Parking Status:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Parking status:', result.data.data);
  } else {
    console.log('Error:', result.error);
  }
}

async function testParkingLogs() {
  console.log('\n🔍 Testing Parking Logs...');
  const result = await makeRequest('GET', '/api/parking-logs/history');
  console.log('Get Parking Logs:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log(`Found ${result.data.data.length} parking logs`);
  } else {
    console.log('Error:', result.error);
  }
}

async function testParkingExit() {
  if (!userId) {
    console.log('\n⚠️ Skipping Parking Exit - missing userId');
    return;
  }
  
  console.log('\n🔍 Testing Parking Exit...');
  const result = await makeRequest('POST', '/api/parking/exit', {
    userId: userId
  });
  console.log('Parking Exit:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.success) {
    console.log('Parking exit successful');
  } else {
    console.log('Error:', result.error);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('Base URL:', BASE_URL);
  
  try {
    // Basic health checks
    await testHealthCheck();
    
    // Auth tests
    await testLogin();
    await testGoogleAuth();
    await testRegister();
    
    // Profile tests
    await testProfile();
    await testUpdateProfile();
    
    // Parking data tests
    await testParkingLots();
    await testParkingSpots();
    
    // Reservation tests
    await testCreateReservation();
    await testGetReservations();
    
    // Payment tests
    await testPaymentInfo();
    await testTestPayment();
    
    // User data tests
    await testUserHistory();
    await testParkingStatus();
    await testParkingLogs();
    await testParkingExit();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
