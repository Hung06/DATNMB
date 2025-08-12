const db = require('./config/database');

async function seedParkingLogs() {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu cho parking_logs và payments...');

    // Lấy danh sách users và parking spots
    const [users] = await db.execute('SELECT user_id FROM users WHERE role = "user" LIMIT 5');
    const [spots] = await db.execute('SELECT spot_id FROM parking_spots LIMIT 10');

    if (users.length === 0 || spots.length === 0) {
      console.log('Cần có users và parking spots trước khi tạo logs');
      return;
    }

    // Tạo dữ liệu mẫu cho parking_logs
    const parkingLogsData = [
      {
        user_id: users[0].user_id,
        spot_id: spots[0].spot_id,
        entry_time: '2024-01-15 08:30:00',
        exit_time: '2024-01-15 10:30:00',
        total_minutes: 120,
        fee: 20000,
        status: 'out'
      },
      {
        user_id: users[0].user_id,
        spot_id: spots[1].spot_id,
        entry_time: '2024-01-16 14:00:00',
        exit_time: '2024-01-16 16:00:00',
        total_minutes: 120,
        fee: 20000,
        status: 'out'
      },
      {
        user_id: users[0].user_id,
        spot_id: spots[2].spot_id,
        entry_time: '2024-01-17 09:15:00',
        exit_time: '2024-01-17 11:45:00',
        total_minutes: 150,
        fee: 25000,
        status: 'out'
      },
      {
        user_id: users[1]?.user_id || users[0].user_id,
        spot_id: spots[3]?.spot_id || spots[0].spot_id,
        entry_time: '2024-01-18 13:30:00',
        exit_time: '2024-01-18 15:30:00',
        total_minutes: 120,
        fee: 20000,
        status: 'out'
      },
      {
        user_id: users[1]?.user_id || users[0].user_id,
        spot_id: spots[4]?.spot_id || spots[1].spot_id,
        entry_time: '2024-01-19 10:00:00',
        exit_time: '2024-01-19 12:30:00',
        total_minutes: 150,
        fee: 25000,
        status: 'out'
      },
      {
        user_id: users[2]?.user_id || users[0].user_id,
        spot_id: spots[5]?.spot_id || spots[2].spot_id,
        entry_time: '2024-01-20 16:00:00',
        exit_time: '2024-01-20 18:00:00',
        total_minutes: 120,
        fee: 20000,
        status: 'out'
      },
      {
        user_id: users[2]?.user_id || users[0].user_id,
        spot_id: spots[6]?.spot_id || spots[3].spot_id,
        entry_time: '2024-01-21 08:45:00',
        exit_time: '2024-01-21 11:15:00',
        total_minutes: 150,
        fee: 25000,
        status: 'out'
      },
      {
        user_id: users[3]?.user_id || users[0].user_id,
        spot_id: spots[7]?.spot_id || spots[4].spot_id,
        entry_time: '2024-01-22 12:00:00',
        exit_time: '2024-01-22 14:30:00',
        total_minutes: 150,
        fee: 25000,
        status: 'out'
      },
      {
        user_id: users[3]?.user_id || users[0].user_id,
        spot_id: spots[8]?.spot_id || spots[5].spot_id,
        entry_time: '2024-01-23 15:30:00',
        exit_time: '2024-01-23 17:30:00',
        total_minutes: 120,
        fee: 20000,
        status: 'out'
      },
      {
        user_id: users[4]?.user_id || users[0].user_id,
        spot_id: spots[9]?.spot_id || spots[6].spot_id,
        entry_time: '2024-01-24 09:00:00',
        exit_time: '2024-01-24 11:00:00',
        total_minutes: 120,
        fee: 20000,
        status: 'out'
      }
    ];

    // Thêm parking logs
    for (const logData of parkingLogsData) {
      const [result] = await db.execute(
        'INSERT INTO parking_logs (user_id, spot_id, entry_time, exit_time, total_minutes, fee, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [logData.user_id, logData.spot_id, logData.entry_time, logData.exit_time, logData.total_minutes, logData.fee, logData.status]
      );
      console.log(`Đã tạo parking log với ID: ${result.insertId}`);
    }

    // Lấy danh sách log_ids vừa tạo
    const [logs] = await db.execute('SELECT log_id FROM parking_logs ORDER BY log_id DESC LIMIT 10');

    // Tạo dữ liệu mẫu cho payments
    const paymentMethods = ['cash', 'momo', 'banking', 'visa'];
    const paymentsData = logs.map((log, index) => ({
      log_id: log.log_id,
      amount: parkingLogsData[index].fee,
      method: paymentMethods[index % paymentMethods.length],
      paid_at: parkingLogsData[index].exit_time
    }));

    // Thêm payments
    for (const paymentData of paymentsData) {
      const [result] = await db.execute(
        'INSERT INTO payments (log_id, amount, method, paid_at) VALUES (?, ?, ?, ?)',
        [paymentData.log_id, paymentData.amount, paymentData.method, paymentData.paid_at]
      );
      console.log(`Đã tạo payment với ID: ${result.insertId}`);
    }

    console.log('Hoàn thành tạo dữ liệu mẫu cho parking_logs và payments!');
    console.log(`Đã tạo ${parkingLogsData.length} parking logs và ${paymentsData.length} payments`);

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
seedParkingLogs();
