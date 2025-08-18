const axios = require('axios');

async function testHistoryParse() {
  try {
    console.log('🔍 Testing history data parsing...');
    
    const response = await axios.get('https://backend-fiif0trfb-hungs-projects-420012d8.vercel.app/api/user/history?userId=1');
    
    console.log('✅ API Response received');
    console.log('Response success:', response.status === 200);
    
    const data = response.data;
    console.log('Data structure:', Object.keys(data));
    
    // Test the same logic as frontend
    const historyData = data.data?.combined_history || data.data?.data || data.data || [];
    console.log('History data type:', typeof historyData);
    console.log('Is array:', Array.isArray(historyData));
    console.log('Length:', historyData?.length || 0);
    
    if (Array.isArray(historyData)) {
      console.log('✅ History data is valid array');
      console.log('First item:', historyData[0]);
      
      // Test filter logic
      const filtered = historyData.filter(item => {
        return true; // all filter
      });
      console.log('✅ Filter works, filtered length:', filtered.length);
      
      // Test reservation filter
      const reservations = historyData.filter(item => item.type === 'reservation');
      console.log('✅ Reservations filter works, count:', reservations.length);
      
      // Test parking filter
      const parking = historyData.filter(item => item.type === 'parking');
      console.log('✅ Parking filter works, count:', parking.length);
      
    } else {
      console.log('❌ History data is not an array:', historyData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testHistoryParse();
