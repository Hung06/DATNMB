const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedCompleteData() {
  try {
    console.log('🚀 Bắt đầu tạo dữ liệu hoàn chỉnh cho user1@gmail.com...\n');

    // 1. Tạo user1@gmail.com nếu chưa có
    console.log('1. Tạo tài khoản user1@gmail.com...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Kiểm tra xem user đã tồn tại chưa
    const [existingUsers] = await db.execute(
      'SELECT user_id FROM users WHERE email = ?',
      ['user1@gmail.com']
    );

    let userId;
    if (existingUsers.length === 0) {
      const [result] = await db.execute(
        'INSERT INTO users (full_name, email, password, phone, license_plate, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['Nguyễn Văn A', 'user1@gmail.com', hashedPassword, '0123456789', '30A-12345', 'user']
      );
      userId = result.insertId;
      console.log(`✅ Đã tạo user với ID: ${userId}`);
    } else {
      userId = existingUsers[0].user_id;
      console.log(`✅ User đã tồn tại với ID: ${userId}`);
    }

    // 2. Tìm bãi đỗ xe Phenikaa
    console.log('\n2. Tìm bãi đỗ xe Phenikaa...');
    const [phenikaaLots] = await db.execute(
      'SELECT lot_id, name, price_per_hour FROM parking_lots WHERE name LIKE ?',
      ['%Phenikaa%']
    );

    if (phenikaaLots.length === 0) {
      console.log('❌ Không tìm thấy bãi đỗ xe Phenikaa');
      return;
    }

    const phenikaaLot = phenikaaLots[0];
    console.log(`✅ Tìm thấy bãi: ${phenikaaLot.name} (ID: ${phenikaaLot.lot_id})`);
    console.log(`💰 Giá: ${phenikaaLot.price_per_hour.toLocaleString()} VNĐ/giờ`);

    // 3. Lấy danh sách chỗ đỗ xe của bãi Phenikaa
    console.log('\n3. Lấy danh sách chỗ đỗ xe của bãi Phenikaa...');
    const [spots] = await db.execute(
      'SELECT spot_id, spot_number FROM parking_spots WHERE lot_id = ? ORDER BY spot_id LIMIT 20',
      [phenikaaLot.lot_id]
    );

    if (spots.length === 0) {
      console.log('❌ Không tìm thấy chỗ đỗ xe nào trong bãi Phenikaa');
      return;
    }

    console.log(`✅ Tìm thấy ${spots.length} chỗ đỗ xe`);

    // 4. Tạo lịch sử đỗ xe cho user1 với phí tính theo thời gian thực tế
    console.log('\n4. Tạo lịch sử đỗ xe cho user1...');
    const parkingLogs = [
      {
        user_id: userId,
        spot_id: spots[0].spot_id,
        entry_time: '2024-01-15 08:30:00',
        exit_time: '2024-01-15 10:30:00',
        total_minutes: 120,
        fee: Math.ceil(120 / 60) * phenikaaLot.price_per_hour, // 2 giờ = 16,000 VNĐ
        status: 'out'
      },
      {
        user_id: userId,
        spot_id: spots[1].spot_id,
        entry_time: '2024-01-16 14:00:00',
        exit_time: '2024-01-16 16:30:00',
        total_minutes: 150,
        fee: Math.ceil(150 / 60) * phenikaaLot.price_per_hour, // 2.5 giờ = 3 giờ = 24,000 VNĐ
        status: 'out'
      },
      {
        user_id: userId,
        spot_id: spots[2].spot_id,
        entry_time: '2024-01-17 09:15:00',
        exit_time: '2024-01-17 11:45:00',
        total_minutes: 150,
        fee: Math.ceil(150 / 60) * phenikaaLot.price_per_hour, // 2.5 giờ = 3 giờ = 24,000 VNĐ
        status: 'out'
      },
      {
        user_id: userId,
        spot_id: spots[3].spot_id,
        entry_time: '2024-01-18 13:30:00',
        exit_time: '2024-01-18 15:30:00',
        total_minutes: 120,
        fee: Math.ceil(120 / 60) * phenikaaLot.price_per_hour, // 2 giờ = 16,000 VNĐ
        status: 'out'
      },
      // Thêm một số lần đỗ xe đang diễn ra
      {
        user_id: userId,
        spot_id: spots[0].spot_id, // Sử dụng lại spot đầu tiên
        entry_time: '2024-01-25 14:00:00',
        exit_time: null,
        total_minutes: null,
        fee: null,
        status: 'in'
      }
    ];

    const logIds = [];
    for (const log of parkingLogs) {
      const [result] = await db.execute(
        'INSERT INTO parking_logs (user_id, spot_id, entry_time, exit_time, total_minutes, fee, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [log.user_id, log.spot_id, log.entry_time, log.exit_time, log.total_minutes, log.fee, log.status]
      );
      logIds.push(result.insertId);
    }
    console.log(`✅ Đã tạo ${parkingLogs.length} lịch sử đỗ xe`);

    // 5. Tạo dữ liệu thanh toán
    console.log('\n5. Tạo dữ liệu thanh toán...');
    const paymentMethods = ['cash', 'momo', 'banking', 'visa'];
    
    for (let i = 0; i < logIds.length - 1; i++) { // Trừ log cuối vì đang đỗ xe
      const logId = logIds[i];
      const log = parkingLogs[i];
      const paymentMethod = paymentMethods[i % paymentMethods.length];
      
      await db.execute(
        'INSERT INTO payments (log_id, amount, method, paid_at) VALUES (?, ?, ?, ?)',
        [logId, log.fee, paymentMethod, log.exit_time]
      );
    }
    console.log(`✅ Đã tạo ${logIds.length - 1} thanh toán`);

    // 6. Tạo một số đặt chỗ (reservations)
    console.log('\n6. Tạo dữ liệu đặt chỗ...');
    const reservations = [
      {
        user_id: userId,
        spot_id: spots[1].spot_id, // Sử dụng spot thứ 2
        reserved_at: '2024-01-26 08:00:00',
        expected_start: '2024-01-26 09:00:00',
        expected_end: '2024-01-26 12:00:00',
        status: 'confirmed'
      },
      {
        user_id: userId,
        spot_id: spots[2].spot_id, // Sử dụng spot thứ 3
        reserved_at: '2024-01-27 10:00:00',
        expected_start: '2024-01-27 11:00:00',
        expected_end: '2024-01-27 14:00:00',
        status: 'pending'
      }
    ];

    for (const reservation of reservations) {
      await db.execute(
        'INSERT INTO reservations (user_id, spot_id, reserved_at, expected_start, expected_end, status) VALUES (?, ?, ?, ?, ?, ?)',
        [reservation.user_id, reservation.spot_id, reservation.reserved_at, reservation.expected_start, reservation.expected_end, reservation.status]
      );
    }
    console.log(`✅ Đã tạo ${reservations.length} đặt chỗ`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 HOÀN THÀNH TẠO DỮ LIỆU!');
    console.log('='.repeat(60));
    console.log(`👤 Tài khoản: user1@gmail.com`);
    console.log(`🔑 Mật khẩu: 123456`);
    console.log(`🆔 User ID: ${userId}`);
    console.log(`🏢 Bãi đỗ xe: ${phenikaaLot.name}`);
    console.log(`💰 Giá: ${phenikaaLot.price_per_hour.toLocaleString()} VNĐ/giờ`);
    console.log(`🚗 Số chỗ đỗ xe sử dụng: ${spots.length}`);
    console.log(`📊 Số lịch sử đỗ xe: ${parkingLogs.length}`);
    console.log(`💳 Số thanh toán: ${logIds.length - 1}`);
    console.log(`📅 Số đặt chỗ: ${reservations.length}`);
    console.log('\n📋 Chi tiết phí theo thời gian:');
    parkingLogs.slice(0, 10).forEach((log, index) => {
      const duration = log.total_minutes ? Math.round(log.total_minutes / 60 * 10) / 10 : 0;
      const hours = Math.ceil(log.total_minutes / 60);
      console.log(`${index + 1}. ${duration} giờ (${hours} giờ tính phí) = ${log.fee?.toLocaleString() || 0} VNĐ`);
    });
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
seedCompleteData();
