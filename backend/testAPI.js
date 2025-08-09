const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test API endpoints
const testAPI = async () => {
  try {
    console.log('🧪 Testing Parking Lot API...\n');

    // Test 1: Lấy tất cả bãi đỗ xe
    console.log('1. Lấy tất cả bãi đỗ xe:');
    const allLots = await axios.get(`${BASE_URL}/parking-lots`);
    console.log(`   ✅ Tìm thấy ${allLots.data.count} bãi đỗ xe`);
    console.log(`   📍 Bao gồm: ${allLots.data.data.length} bãi đỗ xe\n`);

    // Test 2: Tìm bãi đỗ xe theo vị trí (Hà Nội)
    console.log('2. Tìm bãi đỗ xe gần Hà Nội (lat: 21.0015, lng: 105.8165):');
    const nearbyLots = await axios.get(`${BASE_URL}/parking-lots?latitude=21.0015&longitude=105.8165&radius=5`);
    console.log(`   ✅ Tìm thấy ${nearbyLots.data.count} bãi đỗ xe trong bán kính 5km`);
    
    if (nearbyLots.data.data.length > 0) {
      console.log('   📍 Các bãi đỗ xe gần nhất:');
      nearbyLots.data.data.slice(0, 3).forEach((lot, index) => {
        console.log(`      ${index + 1}. ${lot.name} - ${lot.distance?.toFixed(1)}km`);
      });
    }
    console.log('');

    // Test 3: Tìm bãi đỗ xe gần Phenikaa
    console.log('3. Tìm bãi đỗ xe gần Trường Đại học Phenikaa (lat: 20.9721, lng: 105.7381):');
    const phenikaaLots = await axios.get(`${BASE_URL}/parking-lots?latitude=20.9721&longitude=105.7381&radius=10`);
    console.log(`   ✅ Tìm thấy ${phenikaaLots.data.count} bãi đỗ xe trong bán kính 10km`);
    
    if (phenikaaLots.data.data.length > 0) {
      console.log('   📍 Các bãi đỗ xe gần Phenikaa:');
      phenikaaLots.data.data.slice(0, 5).forEach((lot, index) => {
        console.log(`      ${index + 1}. ${lot.name} - ${lot.distance?.toFixed(1)}km - ${lot.pricePerHour?.toLocaleString()} VNĐ/giờ`);
      });
    }
    console.log('');

    // Test 4: Tìm kiếm bãi đỗ xe
    console.log('4. Tìm kiếm bãi đỗ xe có từ "Royal":');
    const searchLots = await axios.get(`${BASE_URL}/parking-lots/search?q=Royal`);
    console.log(`   ✅ Tìm thấy ${searchLots.data.count} bãi đỗ xe`);
    
    if (searchLots.data.data.length > 0) {
      searchLots.data.data.forEach((lot, index) => {
        console.log(`      ${index + 1}. ${lot.name} - ${lot.address}`);
      });
    }
    console.log('');

    // Test 5: Lọc theo giá
    console.log('5. Tìm bãi đỗ xe có giá dưới 15,000 VNĐ/giờ:');
    const cheapLots = await axios.get(`${BASE_URL}/parking-lots/search?maxPrice=15000`);
    console.log(`   ✅ Tìm thấy ${cheapLots.data.count} bãi đỗ xe có giá dưới 15,000 VNĐ/giờ`);
    
    if (cheapLots.data.data.length > 0) {
      cheapLots.data.data.slice(0, 3).forEach((lot, index) => {
        console.log(`      ${index + 1}. ${lot.name} - ${lot.pricePerHour?.toLocaleString()} VNĐ/giờ`);
      });
    }
    console.log('');

    console.log('🎉 Tất cả test đã hoàn thành thành công!');

  } catch (error) {
    console.error('❌ Lỗi khi test API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Chạy test
testAPI();
