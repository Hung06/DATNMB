const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testReservationId = null;

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
        role: data.user?.role
      });
      return true;
    } else {
      console.log('❌ Login thất bại:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi login:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUserReservations() {
  try {
    console.log('\n📋 Test: Lấy danh sách đặt chỗ của user...');
    
    const response = await axios.get(`${BASE_URL}/reservations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Lấy danh sách đặt chỗ thành công');
    console.log(`📊 Số đặt chỗ: ${response.data.count}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📋 Danh sách đặt chỗ:');
      response.data.data.forEach((reservation, index) => {
        console.log(`${index + 1}. ID: ${reservation.reservation_id} - ${reservation.spot_number} - ${reservation.status}`);
      });
      
      // Lưu ID đặt chỗ đầu tiên để test các API khác
      testReservationId = response.data.data[0].reservation_id;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đặt chỗ:', error.response?.data || error.message);
    return false;
  }
}

async function testGetReservationDetail() {
  if (!testReservationId) {
    console.log('⚠️ Bỏ qua test chi tiết đặt chỗ vì chưa có đặt chỗ nào');
    return false;
  }

  try {
    console.log('\n📋 Test: Lấy chi tiết đặt chỗ...');
    
    const response = await axios.get(`${BASE_URL}/reservations/${testReservationId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Lấy chi tiết đặt chỗ thành công');
    console.log('📋 Chi tiết đặt chỗ:', {
      id: response.data.data.reservation_id,
      spot: response.data.data.spot_number,
      status: response.data.data.status,
      parking_lot: response.data.data.parking_lot_name,
      start_time: response.data.data.expected_start,
      end_time: response.data.data.expected_end
    });
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết đặt chỗ:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateReservation() {
  try {
    console.log('\n📋 Test: Tạo đặt chỗ mới...');
    
    // Lấy danh sách chỗ đỗ xe trước
    const spotsResponse = await axios.get(`${BASE_URL}/parking-lots/1/spots`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!spotsResponse.data.data || spotsResponse.data.data.length === 0) {
      console.log('⚠️ Không có chỗ đỗ xe nào để test');
      return false;
    }

    const availableSpot = spotsResponse.data.data.find(spot => !spot.is_occupied && !spot.is_reserved);
    if (!availableSpot) {
      console.log('⚠️ Không có chỗ đỗ xe khả dụng để test');
      return false;
    }

    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 giờ sau
    const endTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 giờ sau

    const reservationData = {
      spotId: availableSpot.spot_id,
      expectedStart: startTime.toISOString().slice(0, 19).replace('T', ' '),
      expectedEnd: endTime.toISOString().slice(0, 19).replace('T', ' '),
      depositAmount: 10000,
      paymentMethod: 'momo'
    };

    const response = await axios.post(`${BASE_URL}/reservations`, reservationData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Tạo đặt chỗ thành công');
    console.log('📋 Thông tin đặt chỗ mới:', {
      reservationId: response.data.data.reservationId,
      depositAmount: response.data.data.depositAmount,
      paymentMethod: response.data.data.paymentMethod
    });

    // Lưu ID đặt chỗ mới để test hủy
    testReservationId = response.data.data.reservationId;
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi tạo đặt chỗ:', error.response?.data || error.message);
    return false;
  }
}

async function testCancelReservation() {
  if (!testReservationId) {
    console.log('⚠️ Bỏ qua test hủy đặt chỗ vì chưa có đặt chỗ nào');
    return false;
  }

  try {
    console.log('\n📋 Test: Hủy đặt chỗ...');
    
    const response = await axios.put(`${BASE_URL}/reservations/${testReservationId}/cancel`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Hủy đặt chỗ thành công');
    console.log('📋 Thông báo:', response.data.message);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi hủy đặt chỗ:', error.response?.data || error.message);
    return false;
  }
}

async function testAdminGetAllReservations() {
  try {
    console.log('\n📋 Test: Lấy tất cả đặt chỗ (Admin)...');
    
    const response = await axios.get(`${BASE_URL}/admin/reservations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Lấy tất cả đặt chỗ thành công');
    console.log(`📊 Tổng số đặt chỗ: ${response.data.count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi lấy tất cả đặt chỗ:', error.response?.data || error.message);
    return false;
  }
}

async function testAdminUpdateReservationStatus() {
  if (!testReservationId) {
    console.log('⚠️ Bỏ qua test cập nhật trạng thái vì chưa có đặt chỗ nào');
    return false;
  }

  try {
    console.log('\n📋 Test: Cập nhật trạng thái đặt chỗ (Admin)...');
    
    const response = await axios.put(`${BASE_URL}/admin/reservations/${testReservationId}/status`, {
      status: 'confirmed'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Cập nhật trạng thái thành công');
    console.log('📋 Thông báo:', response.data.message);
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật trạng thái:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Bắt đầu test Reservation API...\n');

  // Test login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Không thể tiếp tục test vì login thất bại');
    return;
  }

  // Test các API
  const tests = [
    { name: 'Lấy danh sách đặt chỗ', test: testGetUserReservations },
    { name: 'Lấy chi tiết đặt chỗ', test: testGetReservationDetail },
    { name: 'Tạo đặt chỗ mới', test: testCreateReservation },
    { name: 'Cập nhật trạng thái (Admin)', test: testAdminUpdateReservationStatus },
    { name: 'Lấy tất cả đặt chỗ (Admin)', test: testAdminGetAllReservations },
    { name: 'Hủy đặt chỗ', test: testCancelReservation },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const testCase of tests) {
    try {
      const result = await testCase.test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Lỗi trong test "${testCase.name}":`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 KẾT QUẢ TEST RESERVATION API');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('='.repeat(50));

  if (passedTests === totalTests) {
    console.log('🎉 Tất cả test đều thành công!');
  } else {
    console.log('⚠️ Một số test thất bại, vui lòng kiểm tra lại.');
  }
}

// Chạy test
runAllTests().catch(console.error);
