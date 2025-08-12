const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test login để lấy token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user1@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    if (data.success) {
      authToken = data.token;
      console.log('✅ Login thành công, token:', authToken.substring(0, 20) + '...');
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
    const response = await fetch(`${BASE_URL}/parking-logs/history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Lấy lịch sử thành công');
      console.log(`📊 Tìm thấy ${data.data.length} lần đỗ xe`);
      if (data.data.length > 0) {
        console.log('📋 Mẫu dữ liệu:', {
          log_id: data.data[0].log_id,
          parking_lot_name: data.data[0].parking_lot_name,
          spot_number: data.data[0].spot_number,
          status: data.data[0].status,
          fee: data.data[0].fee
        });
      }
    } else {
      console.log('❌ Lấy lịch sử thất bại:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử:', error.message);
  }
}

// Test tạo log đỗ xe mới
async function testCreateEntry() {
  try {
    const response = await fetch(`${BASE_URL}/parking-logs/entry`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spotId: 1
      })
    });

    const data = await response.json();
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

// Test cập nhật log khi ra bãi
async function testUpdateExit(logId) {
  if (!logId) return;
  
  try {
    const response = await fetch(`${BASE_URL}/parking-logs/${logId}/exit`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        totalMinutes: 120,
        fee: 20000
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Cập nhật log ra bãi thành công');
    } else {
      console.log('❌ Cập nhật log ra bãi thất bại:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi cập nhật log ra bãi:', error.message);
  }
}

// Test lấy chi tiết log
async function testGetLogDetail(logId) {
  if (!logId) return;
  
  try {
    const response = await fetch(`${BASE_URL}/parking-logs/${logId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Lấy chi tiết log thành công');
      console.log('📋 Chi tiết:', {
        log_id: data.data.log_id,
        entry_time: data.data.entry_time,
        exit_time: data.data.exit_time,
        total_minutes: data.data.total_minutes,
        fee: data.data.fee,
        status: data.data.status
      });
    } else {
      console.log('❌ Lấy chi tiết log thất bại:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết log:', error.message);
  }
}

// Chạy tất cả tests
async function runAllTests() {
  console.log('🚀 Bắt đầu test Parking Logs API...\n');
  
  // Test login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Không thể tiếp tục test do login thất bại');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test lấy lịch sử
  await testGetHistory();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test tạo log mới
  const newLogId = await testCreateEntry();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test lấy chi tiết log
  await testGetLogDetail(newLogId);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test cập nhật log ra bãi
  await testUpdateExit(newLogId);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test lấy lịch sử lại để xem log mới
  await testGetHistory();
  
  console.log('\n✅ Hoàn thành tất cả tests!');
}

// Chạy tests
runAllTests().catch(console.error);
