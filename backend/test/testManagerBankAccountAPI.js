const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testAccountId = null;

// Test data
const testBankAccount = {
  bank_code: '970414',
  bank_name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  account_number: '9999999999',
  account_name: 'NGUYEN VAN TEST'
};

async function login() {
  try {
    console.log('🔐 Đăng nhập...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'manager1@example.com',
      password: 'manager123'
    });

    if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ Đăng nhập thành công');
      return true;
    } else {
      console.log('❌ Đăng nhập thất bại:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Lỗi đăng nhập:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetVietQRBankCodes() {
  try {
    console.log('\n📋 Lấy danh sách mã ngân hàng VietQR...');
    const response = await axios.get(`${BASE_URL}/bank-codes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log(`✅ Lấy thành công ${response.data.data.length} mã ngân hàng`);
      console.log('📊 5 mã ngân hàng đầu tiên:');
      response.data.data.slice(0, 5).forEach((bank, index) => {
        console.log(`   ${index + 1}. ${bank.code} - ${bank.name}`);
      });
    } else {
      console.log('❌ Lấy danh sách mã ngân hàng thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi lấy danh sách mã ngân hàng:', error.response?.data?.message || error.message);
  }
}

async function testGetMyBankAccounts() {
  try {
    console.log('\n🏦 Lấy danh sách tài khoản ngân hàng của tôi...');
    const response = await axios.get(`${BASE_URL}/manager/bank-accounts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log(`✅ Lấy thành công ${response.data.data.length} tài khoản ngân hàng`);
      if (response.data.data.length > 0) {
        console.log('📊 Danh sách tài khoản:');
        response.data.data.forEach((account, index) => {
          console.log(`   ${index + 1}. ${account.bank_name}`);
          console.log(`      Mã: ${account.bank_code} | Số TK: ${account.account_number} | Chủ TK: ${account.account_name}`);
        });
      } else {
        console.log('📝 Chưa có tài khoản ngân hàng nào');
      }
    } else {
      console.log('❌ Lấy danh sách tài khoản thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi lấy danh sách tài khoản:', error.response?.data?.message || error.message);
  }
}

async function testCreateBankAccount() {
  try {
    console.log('\n➕ Tạo tài khoản ngân hàng mới...');
    const response = await axios.post(`${BASE_URL}/manager/bank-accounts`, testBankAccount, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      testAccountId = response.data.data.account_id;
      console.log('✅ Tạo tài khoản ngân hàng thành công');
      console.log(`📋 ID: ${testAccountId}`);
      console.log(`🏦 Ngân hàng: ${response.data.data.bank_name}`);
      console.log(`📝 Số TK: ${response.data.data.account_number}`);
    } else {
      console.log('❌ Tạo tài khoản thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi tạo tài khoản:', error.response?.data?.message || error.message);
  }
}

async function testGetBankAccountDetail() {
  if (!testAccountId) {
    console.log('\n⚠️  Bỏ qua test lấy chi tiết tài khoản (chưa có account ID)');
    return;
  }

  try {
    console.log('\n📋 Lấy chi tiết tài khoản ngân hàng...');
    const response = await axios.get(`${BASE_URL}/manager/bank-accounts/${testAccountId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log('✅ Lấy chi tiết tài khoản thành công');
      const account = response.data.data;
      console.log(`📋 ID: ${account.account_id}`);
      console.log(`🏦 Ngân hàng: ${account.bank_name} (${account.bank_code})`);
      console.log(`📝 Số TK: ${account.account_number}`);
      console.log(`👤 Chủ TK: ${account.account_name}`);
      console.log(`📅 Tạo lúc: ${account.created_at}`);
    } else {
      console.log('❌ Lấy chi tiết tài khoản thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi lấy chi tiết tài khoản:', error.response?.data?.message || error.message);
  }
}

async function testUpdateBankAccount() {
  if (!testAccountId) {
    console.log('\n⚠️  Bỏ qua test cập nhật tài khoản (chưa có account ID)');
    return;
  }

  try {
    console.log('\n✏️  Cập nhật tài khoản ngân hàng...');
    const updateData = {
      ...testBankAccount,
      account_name: 'NGUYEN VAN UPDATED',
      is_active: true
    };

    const response = await axios.put(`${BASE_URL}/manager/bank-accounts/${testAccountId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Cập nhật tài khoản thành công');
      console.log(`👤 Tên chủ TK mới: ${response.data.data.account_name}`);
    } else {
      console.log('❌ Cập nhật tài khoản thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi cập nhật tài khoản:', error.response?.data?.message || error.message);
  }
}

async function testDeleteBankAccount() {
  if (!testAccountId) {
    console.log('\n⚠️  Bỏ qua test xóa tài khoản (chưa có account ID)');
    return;
  }

  try {
    console.log('\n🗑️  Xóa tài khoản ngân hàng...');
    const response = await axios.delete(`${BASE_URL}/manager/bank-accounts/${testAccountId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log('✅ Xóa tài khoản thành công');
      testAccountId = null; // Reset để tránh test lại
    } else {
      console.log('❌ Xóa tài khoản thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi xóa tài khoản:', error.response?.data?.message || error.message);
  }
}

async function testAdminGetAllBankAccounts() {
  try {
    console.log('\n👑 Test admin lấy tất cả tài khoản ngân hàng...');
    
    // Đăng nhập với tài khoản admin
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'hung@gmail.com',
      password: 'admin123'
    });

    if (!adminResponse.data.token) {
      console.log('❌ Không thể đăng nhập admin, bỏ qua test này');
      return;
    }

    const adminToken = adminResponse.data.token;
    const response = await axios.get(`${BASE_URL}/admin/bank-accounts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      console.log(`✅ Admin lấy thành công ${response.data.data.length} tài khoản ngân hàng`);
      if (response.data.data.length > 0) {
        console.log('📊 Danh sách tài khoản (admin view):');
        response.data.data.slice(0, 3).forEach((account, index) => {
          console.log(`   ${index + 1}. ${account.manager_name} (${account.manager_email})`);
          console.log(`      ${account.bank_name} - ${account.account_number}`);
        });
      }
    } else {
      console.log('❌ Admin lấy danh sách thất bại:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Lỗi admin lấy danh sách:', error.response?.data?.message || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Bắt đầu test Manager Bank Account API...\n');

  // Test đăng nhập
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Không thể đăng nhập, dừng test');
    return;
  }

  // Test các endpoints
  await testGetVietQRBankCodes();
  await testGetMyBankAccounts();
  await testCreateBankAccount();
  await testGetBankAccountDetail();
  await testUpdateBankAccount();
  await testDeleteBankAccount();
  await testAdminGetAllBankAccounts();

  console.log('\n✅ Hoàn thành tất cả tests!');
}

runAllTests().catch(console.error);
