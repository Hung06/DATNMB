const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupPaymentTables() {
  let connection;
  
  try {
    // Hiển thị thông tin kết nối (ẩn password)
    console.log('Attempting to connect to database...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'datn');
    console.log('Port:', process.env.DB_PORT || 3307);
    
    // Kết nối database với thông tin cố định
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'datn',
      port: 3307,
      connectTimeout: 60000, // 60 giây timeout
      timeout: 60000,
    });

    console.log('✅ Connected to database successfully');

    // Tạo bảng payment_logs
    const createPaymentLogsTable = `
      CREATE TABLE IF NOT EXISTS payment_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reservation_id INT NOT NULL,
        transaction_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'sepay',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        bank_code VARCHAR(50),
        account_number VARCHAR(50),
        transaction_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_reservation_id (reservation_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `;

    await connection.execute(createPaymentLogsTable);
    console.log('✅ Payment logs table created/verified');

    // Thêm cột payment vào bảng reservations (kiểm tra từng cột)
    const checkAndAddColumn = async (columnName, columnDef) => {
      try {
        const [columns] = await connection.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'datn' AND TABLE_NAME = 'reservations' AND COLUMN_NAME = ?`,
          [columnName]
        );
        
        if (columns.length === 0) {
          await connection.execute(`ALTER TABLE reservations ADD COLUMN ${columnName} ${columnDef}`);
          console.log(`✅ Added column: ${columnName}`);
        } else {
          console.log(`✅ Column already exists: ${columnName}`);
        }
      } catch (error) {
        console.log(`⚠️ Error checking/adding column ${columnName}:`, error.message);
      }
    };

    await checkAndAddColumn('payment_id', 'VARCHAR(255) NULL');
    await checkAndAddColumn('payment_method', "VARCHAR(50) NULL DEFAULT 'sepay'");
    await checkAndAddColumn('payment_amount', 'DECIMAL(10,2) NULL');
    await checkAndAddColumn('payment_time', 'DATETIME NULL');
    
    console.log('✅ Payment columns checked/added to reservations table');

    // Tạo index cho payment_id (kiểm tra trước)
    try {
      const [indexes] = await connection.execute(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = 'datn' AND TABLE_NAME = 'reservations' AND INDEX_NAME = 'idx_reservations_payment_id'`
      );
      
      if (indexes.length === 0) {
        await connection.execute('CREATE INDEX idx_reservations_payment_id ON reservations(payment_id)');
        console.log('✅ Payment index created');
      } else {
        console.log('✅ Payment index already exists');
      }
    } catch (error) {
      console.log('⚠️ Error creating index:', error.message);
    }

    console.log('🎉 Payment tables setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up payment tables:', error);
    
    // Hiển thị thông tin lỗi chi tiết
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Kiểm tra MySQL server có đang chạy không:');
      console.error('   - Windows: Kiểm tra Services > MySQL');
      console.error('   - Linux/Mac: sudo systemctl status mysql');
      console.error('2. Kiểm tra thông tin kết nối trong file .env:');
      console.error('   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
      console.error('3. Thử kết nối bằng command line:');
      console.error(`   mysql -h ${process.env.DB_HOST || 'localhost'} -u ${process.env.DB_USER || 'root'} -p`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Kiểm tra username và password trong file .env');
      console.error('2. Đảm bảo user có quyền truy cập database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Database không tồn tại, tạo database trước:');
      console.error(`   CREATE DATABASE ${process.env.DB_NAME || 'datn'};`);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Chạy setup nếu file được gọi trực tiếp
if (require.main === module) {
  setupPaymentTables();
}

module.exports = setupPaymentTables;
