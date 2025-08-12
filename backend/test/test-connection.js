const axios = require('axios');

const testConnection = async () => {
  const urls = [
  'http://localhost:5000/api/parking-lots',
  'http://192.168.0.101:5000/api/parking-lots',
  'http://127.0.0.1:5000/api/parking-lots'
];

  console.log('🧪 Testing connection to backend...\n');

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url);
      console.log(`✅ SUCCESS: ${url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data count: ${response.data.count || response.data.length}`);
      console.log('');
      return url;
    } catch (error) {
      console.log(`❌ FAILED: ${url}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('❌ All connection attempts failed!');
  console.log('Please make sure the backend server is running on port 5000');
};

testConnection();

