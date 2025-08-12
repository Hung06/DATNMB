const db = require('./config/database');

async function checkPhenikaaData() {
  try {
    console.log('🔍 Kiểm tra dữ liệu bãi Phenikaa...\n');

    // 1. Kiểm tra bãi đỗ xe Phenikaa
    console.log('1. Kiểm tra bãi đỗ xe Phenikaa...');
    const [phenikaaLots] = await db.execute(
      'SELECT lot_id, name, price_per_hour, total_spots FROM parking_lots WHERE name LIKE ?',
      ['%Phenikaa%']
    );

    if (phenikaaLots.length === 0) {
      console.log('❌ Không tìm thấy bãi đỗ xe Phenikaa');
      return;
    }

    const phenikaaLot = phenikaaLots[0];
    console.log(`✅ Tìm thấy bãi: ${phenikaaLot.name}`);
    console.log(`🆔 ID: ${phenikaaLot.lot_id}`);
    console.log(`💰 Giá: ${phenikaaLot.price_per_hour.toLocaleString()} VNĐ/giờ`);
    console.log(`📊 Tổng chỗ: ${phenikaaLot.total_spots}`);

    // 2. Kiểm tra chỗ đỗ xe
    console.log('\n2. Kiểm tra chỗ đỗ xe...');
    const [spots] = await db.execute(
      'SELECT spot_id, spot_number, spot_type, is_occupied, is_reserved FROM parking_spots WHERE lot_id = ?',
      [phenikaaLot.lot_id]
    );

    console.log(`📋 Tìm thấy ${spots.length} chỗ đỗ xe:`);
    if (spots.length > 0) {
      spots.forEach((spot, index) => {
        console.log(`${index + 1}. ${spot.spot_number} (${spot.spot_type}) - ${spot.is_occupied ? 'Đã chiếm' : 'Trống'} - ${spot.is_reserved ? 'Đã đặt' : 'Chưa đặt'}`);
      });
    } else {
      console.log('❌ Không có chỗ đỗ xe nào');
    }

    // 3. Kiểm tra lịch sử đỗ xe
    console.log('\n3. Kiểm tra lịch sử đỗ xe...');
    const [logs] = await db.execute(
      'SELECT COUNT(*) as total FROM parking_logs pl JOIN parking_spots ps ON pl.spot_id = ps.spot_id WHERE ps.lot_id = ?',
      [phenikaaLot.lot_id]
    );

    console.log(`📊 Tổng lịch sử đỗ xe: ${logs[0].total}`);

    // 4. Kiểm tra thanh toán
    console.log('\n4. Kiểm tra thanh toán...');
    const [payments] = await db.execute(
      'SELECT COUNT(*) as total FROM payments p JOIN parking_logs pl ON p.log_id = pl.log_id JOIN parking_spots ps ON pl.spot_id = ps.spot_id WHERE ps.lot_id = ?',
      [phenikaaLot.lot_id]
    );

    console.log(`💳 Tổng thanh toán: ${payments[0].total}`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

checkPhenikaaData();
