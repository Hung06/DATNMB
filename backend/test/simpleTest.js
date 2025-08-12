const axios = require('axios');

const testSimple = async () => {
  try {
    console.log('🧪 Testing API connection...');
    
    const response = await axios.get('http://localhost:5000/api/parking-lots');
    console.log('✅ API response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Server không chạy hoặc không thể kết nối');
    }
  }
};

testSimple();
