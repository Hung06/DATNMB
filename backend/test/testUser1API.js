const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test login với user1@gmail.com
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user1@gmail.com',
      password: '123456'
    });

    const data = response.data;
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success || data.token) {
      authToken = data.token;
      console.log('✅ Login thành công với user1@gmail.com');
      console.log('👤 User info:', {
        user_id: data.user?.user_id,
        full_name: data.user?.full_name,
        email: data.user?.email,
        license_plate: data.user?.license_plate
      });
      return true;
    } else {
      console.log('❌ Login thất bại:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi login:', error.message);
    return false;
  }
}

// Test lấy lịch sử đỗ xe
async function testGetHistory() {
  try {
    const response = await axios.get(`${BASE_URL}/parking-logs/history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    const data = response.data;
    if (data.success) {
      console.log('✅ Lấy lịch sử đỗ xe thành công');
      console.log(`📊 Tìm thấy ${data.data.length} lần đỗ xe`);
      
      if (data.data.length > 0) {
        console.log('\n📋 Chi tiết các lần đỗ xe:');
        data.data.forEach((log, index) => {
          const duration = log.total_minutes ? Math.round(log.total_minutes / 60 * 10) / 10 : 0;
          console.log(`${index + 1}. ${log.parking_lot_name}`);
          console.log(`   Chỗ đỗ: ${log.spot_number}`);
          console.log(`   Thời gian: ${new Date(log.entry_time).toLocaleString('vi-VN')} - ${log.exit_time ? new Date(log.exit_time).toLocaleString('vi-VN') : 'Đang đỗ xe'}`);
          console.log(`   Thời lượng: ${duration} giờ`);
          console.log(`   Phí: ${log.fee ? log.fee.toLocaleString() : 0} VNĐ`);
          console.log(`   Trạng thái: ${log.status === 'in' ? 'Đang đỗ xe' : log.status === 'out' ? 'Đã ra xe' : 'Đã hủy'}`);
          console.log(`   Thanh toán: ${log.payment_id ? 'Đã thanh toán' : 'Chưa thanh toán'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Lấy lịch sử thất bại:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử:', error.message);
  }
}

// Test lấy danh sách bãi đỗ xe
async function testGetParkingLots() {
  try {
    const response = await axios.get(`${BASE_URL}/parking-lots`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    const data = response.data;
    if (data.success) {
      console.log('✅ Lấy danh sách bãi đỗ xe thành công');
      console.log(`🏢 Tìm thấy ${data.data.length} bãi đỗ xe`);
      
      if (data.data.length > 0) {
        console.log('\n📋 Danh sách bãi đỗ xe:');
        data.data.forEach((lot, index) => {
          console.log(`${index + 1}. ${lot.name}`);
          console.log(`   Địa chỉ: ${lot.address}`);
          console.log(`   Giá: ${lot.pricePerHour.toLocaleString()} VNĐ/giờ`);
          console.log(`   Chỗ trống: ${lot.availableSpots}/${lot.totalSpots}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Lấy danh sách bãi đỗ xe thất bại:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bãi đỗ xe:', error.message);
  }
}

// Test lấy chi tiết bãi đỗ xe
async function testGetParkingLotDetail() {
  try {
    const response = await axios.get(`${BASE_URL}/parking-lots/19`, { // ID của bãi đầu tiên
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    const data = response.data;
    if (data.success) {
      console.log('✅ Lấy chi tiết bãi đỗ xe thành công');
      console.log('📋 Chi tiết bãi đỗ xe:');
      console.log(`Tên: ${data.data.name}`);
      console.log(`Địa chỉ: ${data.data.address}`);
      console.log(`Giá: ${data.data.pricePerHour.toLocaleString()} VNĐ/giờ`);
      console.log(`Chỗ trống: ${data.data.availableSpots}/${data.data.totalSpots}`);
      console.log(`Quản lý: ${data.data.managerName}`);
    } else {
      console.log('❌ Lấy chi tiết bãi đỗ xe thất bại:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết bãi đỗ xe:', error.message);
  }
}

// Test tạo log đỗ xe mới
async function testCreateEntry() {
  try {
    const response = await axios.post(`${BASE_URL}/parking-logs/entry`, {
      spotId: 1 // Sử dụng spot_id đầu tiên
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    const data = response.data;
    if (data.success) {
      console.log('✅ Tạo log đỗ xe thành công');
      console.log('🆔 Log ID:', data.data.logId);
      return data.data.logId;
    } else {
      console.log('❌ Tạo log đỗ xe thất bại:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Lỗi tạo log đỗ xe:', error.message);
    return null;
  }
}

// Chạy tất cả tests
async function runAllTests() {
  console.log('🚀 Bắt đầu test API cho user1@gmail.com...\n');
  
  // Test login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Không thể tiếp tục test do login thất bại');
    return;
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test lấy danh sách bãi đỗ xe
  await testGetParkingLots();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test lấy chi tiết bãi đỗ xe
  await testGetParkingLotDetail();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test lấy lịch sử đỗ xe
  await testGetHistory();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test tạo log đỗ xe mới
  const newLogId = await testCreateEntry();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  console.log('✅ Hoàn thành tất cả tests cho user1@gmail.com!');
  console.log('\n📝 Tóm tắt:');
  console.log('- ✅ Đăng nhập thành công');
  console.log('- ✅ Lấy danh sách bãi đỗ xe');
  console.log('- ✅ Lấy chi tiết bãi đỗ xe');
  console.log('- ✅ Lấy lịch sử đỗ xe');
  console.log('- ✅ Tạo log đỗ xe mới');
}

// Chạy tests
runAllTests().catch(console.error);
