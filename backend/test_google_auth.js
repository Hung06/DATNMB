const axios = require('axios');

async function testGoogleAuth() {
  const apiUrl = 'https://backend-aztfkkvdn-hungs-projects-420012d8.vercel.app';
  
  try {
    console.log('🧪 Testing Google Auth...');
    
    // Test data mô phỏng Google Auth
    const testData = {
      idToken: 'test-google-token',
      email: 'nhorang693@gmail.com',
      user: {
        email: 'nhorang693@gmail.com',
        name: 'rang nho',
        givenName: 'rang',
        familyName: 'nho'
      }
    };
    
    console.log('📤 Sending test data:', testData);
    
    const response = await axios.post(`${apiUrl}/api/auth/google`, testData);
    
    console.log('✅ Google Auth Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Google Auth Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testGoogleAuth();
