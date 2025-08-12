const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log('Environment variables:');
    console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
    console.log('- DB_USER:', process.env.DB_USER || 'root');
    console.log('- DB_NAME:', process.env.DB_NAME || 'datn');
    console.log('- DB_PORT:', process.env.DB_PORT || 3307);
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');
    
         // Thử kết nối không có database trước
     console.log('\n📡 Testing connection to MySQL server...');
     connection = await mysql.createConnection({
       host: process.env.DB_HOST || 'localhost',
       user: process.env.DB_USER || 'root',
       password: process.env.DB_PASSWORD || '',
       port: process.env.DB_PORT || 3307,
       connectTimeout: 10000,
     });
    
    console.log('✅ Successfully connected to MySQL server');
    
    // Kiểm tra database có tồn tại không
    console.log('\n📊 Checking if database exists...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbNames = databases.map(db => db.Database);
    
    if (dbNames.includes(process.env.DB_NAME || 'datn')) {
      console.log('✅ Database exists:', process.env.DB_NAME || 'datn');
      
      // Thử kết nối vào database cụ thể
      await connection.end();
             connection = await mysql.createConnection({
         host: process.env.DB_HOST || 'localhost',
         user: process.env.DB_USER || 'root',
         password: process.env.DB_PASSWORD || '',
         database: process.env.DB_NAME || 'datn',
         port: process.env.DB_PORT || 3307,
         connectTimeout: 10000,
       });
      
      console.log('✅ Successfully connected to database');
      
      // Kiểm tra các bảng hiện có
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('\n📋 Existing tables:');
      if (tables.length === 0) {
        console.log('   No tables found');
      } else {
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
      }
      
    } else {
      console.log('❌ Database does not exist:', process.env.DB_NAME || 'datn');
      console.log('Available databases:', dbNames.join(', '));
      console.log('\n🔧 To create database, run:');
      console.log(`CREATE DATABASE ${process.env.DB_NAME || 'datn'};`);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 MySQL server is not running or not accessible');
      console.error('Solutions:');
      console.error('1. Start MySQL server');
      console.error('2. Check if MySQL is running on the correct port');
      console.error('3. Check firewall settings');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Access denied - check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n🔧 Database does not exist');
    }
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = testDatabaseConnection;
