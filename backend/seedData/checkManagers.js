const db = require('./config/database');

async function checkManagers() {
  try {
    console.log('🔍 Kiểm tra managers trong database...\n');

    // Lấy tất cả users có role manager
    const [managers] = await db.execute(
      'SELECT user_id, full_name, email, role FROM users WHERE role = ? OR role = ?',
      ['manager', 'admin']
    );

    if (managers.length === 0) {
      console.log('❌ Không tìm thấy manager nào trong hệ thống');
      return;
    }

    console.log(`✅ Tìm thấy ${managers.length} manager/admin:`);
    managers.forEach((manager, index) => {
      console.log(`${index + 1}. ${manager.full_name} (${manager.email}) - Role: ${manager.role} - ID: ${manager.user_id}`);
    });

    // Kiểm tra tài khoản ngân hàng của từng manager
    console.log('\n📋 Tài khoản ngân hàng của từng manager:');
    for (const manager of managers) {
      const [bankAccounts] = await db.execute(
        'SELECT COUNT(*) as count FROM manager_bank_accounts WHERE user_id = ? AND is_active = TRUE',
        [manager.user_id]
      );

      console.log(`\n👤 ${manager.full_name} (${manager.email}):`);
      console.log(`   📊 Số tài khoản ngân hàng: ${bankAccounts[0].count}`);

      if (bankAccounts[0].count > 0) {
        const [accounts] = await db.execute(
          'SELECT bank_name, bank_code, account_number FROM manager_bank_accounts WHERE user_id = ? AND is_active = TRUE',
          [manager.user_id]
        );

        accounts.forEach((account, index) => {
          console.log(`   ${index + 1}. ${account.bank_name} (${account.bank_code}) - ${account.account_number}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Lỗi kiểm tra managers:', error);
  } finally {
    process.exit(0);
  }
}

checkManagers();
