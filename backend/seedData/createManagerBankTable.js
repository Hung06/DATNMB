const db = require('./config/database');

async function createManagerBankTable() {
  try {
    console.log('🚀 Bắt đầu tạo bảng manager_bank_accounts...\n');

    // SQL để tạo bảng
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS manager_bank_accounts (
        account_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        bank_code VARCHAR(10) NOT NULL COMMENT 'Mã ngân hàng theo chuẩn VietQR',
        bank_name VARCHAR(100) NOT NULL COMMENT 'Tên ngân hàng',
        account_number VARCHAR(50) NOT NULL COMMENT 'Số tài khoản',
        account_name VARCHAR(100) NOT NULL COMMENT 'Tên chủ tài khoản',
        is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY unique_user_bank (user_id, bank_code, account_number)
      ) COMMENT = 'Bảng lưu trữ thông tin tài khoản ngân hàng của manager theo chuẩn VietQR'
    `;

    // Tạo bảng
    console.log('1. Tạo bảng manager_bank_accounts...');
    await db.execute(createTableSQL);
    console.log('✅ Bảng manager_bank_accounts đã được tạo thành công');

    // Tạo indexes
    console.log('\n2. Tạo indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_manager_bank_user_id ON manager_bank_accounts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_manager_bank_code ON manager_bank_accounts(bank_code)',
      'CREATE INDEX IF NOT EXISTS idx_manager_bank_active ON manager_bank_accounts(is_active)'
    ];

    for (const indexSQL of indexes) {
      try {
        await db.execute(indexSQL);
        console.log('✅ Index đã được tạo');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ️  Index đã tồn tại, bỏ qua');
        } else {
          console.log('⚠️  Lỗi tạo index:', error.message);
        }
      }
    }

    // Kiểm tra bảng đã được tạo
    console.log('\n3. Kiểm tra bảng...');
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'manager_bank_accounts'"
    );

    if (tables.length > 0) {
      console.log('✅ Bảng manager_bank_accounts đã tồn tại trong database');
      
      // Kiểm tra cấu trúc bảng
      const [columns] = await db.execute(
        "DESCRIBE manager_bank_accounts"
      );
      
      console.log('\n📋 Cấu trúc bảng manager_bank_accounts:');
      columns.forEach(column => {
        console.log(`   ${column.Field} - ${column.Type} - ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} - ${column.Key || ''}`);
      });
    } else {
      console.log('❌ Bảng manager_bank_accounts chưa được tạo');
    }

    console.log('\n✅ Hoàn thành tạo bảng manager_bank_accounts!');
    console.log('\n💡 Bây giờ có thể chạy:');
    console.log('   - node seedManagerBankAccounts.js (để tạo dữ liệu mẫu)');
    console.log('   - node testManagerBankAccountAPI.js (để test API)');

  } catch (error) {
    console.error('❌ Lỗi tạo bảng:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
createManagerBankTable();
