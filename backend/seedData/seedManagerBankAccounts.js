const db = require('./config/database');

async function seedManagerBankAccounts() {
  try {
    console.log('🚀 Bắt đầu tạo dữ liệu tài khoản ngân hàng cho managers...\n');

    // 1. Tìm tất cả users có role manager
    console.log('1. Tìm users có role manager...');
    const [managers] = await db.execute(
      'SELECT user_id, full_name, email FROM users WHERE role = ?',
      ['manager']
    );

    if (managers.length === 0) {
      console.log('❌ Không tìm thấy manager nào trong hệ thống');
      console.log('💡 Vui lòng chạy script tạo manager trước: node createManagers.js');
      return;
    }

    console.log(`✅ Tìm thấy ${managers.length} manager:`);
    managers.forEach((manager, index) => {
      console.log(`${index + 1}. ${manager.full_name} (${manager.email}) - ID: ${manager.user_id}`);
    });

    // 2. Dữ liệu tài khoản ngân hàng mẫu
    const sampleBankAccounts = [
      {
        bank_code: '970414',
        bank_name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
        account_number: '1234567890',
        account_name: 'NGUYEN VAN A'
      },
      {
        bank_code: '970415',
        bank_name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)',
        account_number: '0987654321',
        account_name: 'NGUYEN VAN A'
      },
      {
        bank_code: '970405',
        bank_name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
        account_number: '1122334455',
        account_name: 'NGUYEN VAN A'
      },
      {
        bank_code: '970436',
        bank_name: 'Ngân hàng TMCP Tiên Phong (TPBank)',
        account_number: '5566778899',
        account_name: 'NGUYEN VAN A'
      },
      {
        bank_code: '970407',
        bank_name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
        account_number: '9988776655',
        account_name: 'NGUYEN VAN A'
      }
    ];

    // 3. Tạo tài khoản ngân hàng cho từng manager
    console.log('\n2. Tạo tài khoản ngân hàng cho managers...');
    
    for (const manager of managers) {
      console.log(`\n📋 Tạo tài khoản cho ${manager.full_name}...`);
      
      // Tạo 2-3 tài khoản ngân hàng cho mỗi manager
      const accountsToCreate = sampleBankAccounts.slice(0, Math.floor(Math.random() * 3) + 2);
      
      for (const account of accountsToCreate) {
        try {
          // Kiểm tra xem tài khoản đã tồn tại chưa
          const [existing] = await db.execute(
            'SELECT COUNT(*) as count FROM manager_bank_accounts WHERE user_id = ? AND bank_code = ? AND account_number = ?',
            [manager.user_id, account.bank_code, account.account_number]
          );

          if (existing[0].count > 0) {
            console.log(`   ⚠️  Tài khoản ${account.bank_name} đã tồn tại, bỏ qua`);
            continue;
          }

          // Tạo tài khoản mới
          await db.execute(
            `INSERT INTO manager_bank_accounts 
             (user_id, bank_code, bank_name, account_number, account_name, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              manager.user_id,
              account.bank_code,
              account.bank_name,
              account.account_number,
              account.account_name,
              true
            ]
          );

          console.log(`   ✅ Đã tạo tài khoản: ${account.bank_name} - ${account.account_number}`);
        } catch (error) {
          console.error(`   ❌ Lỗi tạo tài khoản ${account.bank_name}:`, error.message);
        }
      }
    }

    // 4. Kiểm tra kết quả
    console.log('\n3. Kiểm tra kết quả...');
    const [totalAccounts] = await db.execute(
      'SELECT COUNT(*) as total FROM manager_bank_accounts WHERE is_active = TRUE'
    );

    console.log(`📊 Tổng số tài khoản ngân hàng đã tạo: ${totalAccounts[0].total}`);

    // 5. Hiển thị danh sách tài khoản theo manager
    console.log('\n4. Danh sách tài khoản ngân hàng theo manager:');
    const [allAccounts] = await db.execute(`
      SELECT 
        mba.account_id,
        mba.bank_code,
        mba.bank_name,
        mba.account_number,
        mba.account_name,
        mba.is_active,
        u.full_name as manager_name,
        u.email as manager_email
      FROM manager_bank_accounts mba
      LEFT JOIN users u ON mba.user_id = u.user_id
      WHERE mba.is_active = TRUE
      ORDER BY u.full_name, mba.created_at
    `);

    let currentManager = '';
    allAccounts.forEach((account, index) => {
      if (account.manager_name !== currentManager) {
        currentManager = account.manager_name;
        console.log(`\n👤 ${currentManager} (${account.manager_email}):`);
      }
      console.log(`   ${index + 1}. ${account.bank_name}`);
      console.log(`      Mã: ${account.bank_code} | Số TK: ${account.account_number} | Chủ TK: ${account.account_name}`);
    });

    console.log('\n✅ Hoàn thành tạo dữ liệu tài khoản ngân hàng cho managers!');
    console.log('\n💡 Có thể test API với các endpoints:');
    console.log('   - GET /api/manager/bank-accounts (cho manager)');
    console.log('   - GET /api/admin/bank-accounts (cho admin)');
    console.log('   - GET /api/bank-codes (cho tất cả)');

  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu tài khoản ngân hàng:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
seedManagerBankAccounts();
