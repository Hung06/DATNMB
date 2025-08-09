const bcrypt = require('bcryptjs');
const db = require('./config/database');

const createAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin chưa
    const [existingAdmin] = await db.execute(
      'SELECT * FROM users WHERE role = "admin" LIMIT 1'
    );

    if (existingAdmin.length > 0) {
      console.log('Admin đã tồn tại!');
      process.exit(0);
    }

    // Tạo password hash
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Tạo admin user
    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, password, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Admin', 'admin@example.com', hashedPassword, '0123456789', 'admin']
    );

    console.log('Đã tạo admin user thành công!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('User ID:', result.insertId);

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi tạo admin:', error);
    process.exit(1);
  }
};

createAdmin();
