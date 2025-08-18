const axios = require('axios');

const BASE_URL = 'https://backend-mvghp1d15-hungs-projects-420012d8.vercel.app';

async function testConnection() {
  console.log('🔍 Testing connection to:', BASE_URL);
  
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testConnection();
