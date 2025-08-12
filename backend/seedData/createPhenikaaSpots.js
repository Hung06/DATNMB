const db = require('./config/database');

async function createPhenikaaSpots() {
  try {
    console.log('🚀 Tạo chỗ đỗ xe cho bãi Phenikaa...\n');

    // 1. Tìm bãi đỗ xe Phenikaa
    console.log('1. Tìm bãi đỗ xe Phenikaa...');
    const [phenikaaLots] = await db.execute(
      'SELECT lot_id, name, total_spots FROM parking_lots WHERE name LIKE ?',
      ['%Phenikaa%']
    );

    if (phenikaaLots.length === 0) {
      console.log('❌ Không tìm thấy bãi đỗ xe Phenikaa');
      return;
    }

    const phenikaaLot = phenikaaLots[0];
    console.log(`✅ Tìm thấy bãi: ${phenikaaLot.name} (ID: ${phenikaaLot.lot_id})`);

    // 2. Kiểm tra số chỗ đỗ xe hiện có
    const [existingSpots] = await db.execute(
      'SELECT COUNT(*) as count FROM parking_spots WHERE lot_id = ?',
      [phenikaaLot.lot_id]
    );

    console.log(`📊 Hiện có: ${existingSpots[0].count} chỗ đỗ xe`);
    console.log(`📊 Tổng cần: ${phenikaaLot.total_spots} chỗ đỗ xe`);

    // 3. Tạo thêm chỗ đỗ xe nếu cần
    const spotsToCreate = phenikaaLot.total_spots - existingSpots[0].count;
    
    if (spotsToCreate > 0) {
      console.log(`\n2. Tạo thêm ${spotsToCreate} chỗ đỗ xe...`);
      
      for (let i = existingSpots[0].count + 1; i <= phenikaaLot.total_spots; i++) {
        const spotType = i <= 5 ? 'vip' : (i <= 10 ? 'ev' : 'standard');
        const spotNumber = `P${i.toString().padStart(3, '0')}`;
        
        await db.execute(
          'INSERT INTO parking_spots (lot_id, spot_number, spot_type, is_occupied, is_reserved) VALUES (?, ?, ?, ?, ?)',
          [phenikaaLot.lot_id, spotNumber, spotType, false, false]
        );
      }
      
      console.log(`✅ Đã tạo ${spotsToCreate} chỗ đỗ xe mới`);
    } else {
      console.log('✅ Đã có đủ chỗ đỗ xe');
    }

    // 4. Kiểm tra lại
    const [finalSpots] = await db.execute(
      'SELECT COUNT(*) as count FROM parking_spots WHERE lot_id = ?',
      [phenikaaLot.lot_id]
    );

    console.log(`\n📊 Tổng chỗ đỗ xe sau khi tạo: ${finalSpots[0].count}`);

    // 5. Hiển thị danh sách chỗ đỗ xe
    const [spots] = await db.execute(
      'SELECT spot_id, spot_number, spot_type FROM parking_spots WHERE lot_id = ? ORDER BY spot_id',
      [phenikaaLot.lot_id]
    );

    console.log('\n📋 Danh sách chỗ đỗ xe:');
    spots.forEach((spot, index) => {
      console.log(`${index + 1}. ${spot.spot_number} (${spot.spot_type}) - ID: ${spot.spot_id}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

createPhenikaaSpots();
