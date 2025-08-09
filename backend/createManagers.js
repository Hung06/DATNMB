const bcrypt = require('bcryptjs');
const db = require('./config/database');

const createManagers = async () => {
  try {
    console.log('🔧 Tạo manager users...');

    // Kiểm tra xem đã có manager chưa
    const [existingManagers] = await db.execute(
      'SELECT * FROM users WHERE role = "manager"'
    );

    if (existingManagers.length >= 2) {
      console.log('✅ Đã có đủ manager!');
      console.log('Manager hiện tại:');
      existingManagers.forEach(manager => {
        console.log(`   - ID: ${manager.user_id}, Email: ${manager.email}, Tên: ${manager.full_name}`);
      });
      return;
    }

    // Tạo password hash
    const hashedPassword = await bcrypt.hash('manager123', 10);

    // Tạo manager 1
    const [result1] = await db.execute(
      `INSERT INTO users (full_name, email, password, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Manager Hà Nội', 'manager1@example.com', hashedPassword, '0123456789', 'manager']
    );

    // Tạo manager 2
    const [result2] = await db.execute(
      `INSERT INTO users (full_name, email, password, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Manager Phenikaa', 'manager2@example.com', hashedPassword, '0987654321', 'manager']
    );

    console.log('✅ Đã tạo manager thành công!');
    console.log('Manager 1:');
    console.log('   Email: manager1@example.com');
    console.log('   Password: manager123');
    console.log('   User ID:', result1.insertId);
    console.log('');
    console.log('Manager 2:');
    console.log('   Email: manager2@example.com');
    console.log('   Password: manager123');
    console.log('   User ID:', result2.insertId);

  } catch (error) {
    console.error('❌ Lỗi khi tạo manager:', error);
    throw error;
  }
};

// Chạy nếu được gọi trực tiếp
if (require.main === module) {
  createManagers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createManagers;


