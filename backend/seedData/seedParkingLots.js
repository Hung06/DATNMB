const db = require('./config/database');
const createManagers = require('./createManagers');

const parkingLotsData = [
  // HÀ NỘI
  {
    name: 'Bãi đỗ xe Trung tâm Thương mại Royal City',
    address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    latitude: 21.0015,
    longitude: 105.8165,
    totalSpots: 350,
    pricePerHour: 18000,
    managerId: 3
  },
  {
    name: 'Bãi đỗ xe Vincom Mega Mall Times City',
    address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
    latitude: 20.9989,
    longitude: 105.8564,
    totalSpots: 280,
    pricePerHour: 16000,
    managerId: 3
  },
  {
    name: 'Bãi đỗ xe Lotte Center Hanoi',
    address: '54 Liễu Giai, Ba Đình, Hà Nội',
    latitude: 21.0352,
    longitude: 105.8147,
    totalSpots: 200,
    pricePerHour: 20000,
    managerId: 3
  },
  {
    name: 'Bãi đỗ xe AEON Mall Long Biên',
    address: '27 Cổ Linh, Long Biên, Hà Nội',
    latitude: 21.0478,
    longitude: 105.8867,
    totalSpots: 220,
    pricePerHour: 12000,
    managerId: 3
  },
  {
    name: 'Bãi đỗ xe Trung tâm Thương mại The Manor',
    address: '91 Nguyễn Hữu Cầu, Đống Đa, Hà Nội',
    latitude: 21.0169,
    longitude: 105.8308,
    totalSpots: 150,
    pricePerHour: 14000,
    managerId: 2
  },
  {
    name: 'Bãi đỗ xe Parkson Keangnam',
    address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội',
    latitude: 21.0169,
    longitude: 105.7821,
    totalSpots: 180,
    pricePerHour: 15000,
    managerId: 2
  },
  {
    name: 'Bãi đỗ xe Trung tâm Thương mại Savico Megamall',
    address: '7-9 Nguyễn Văn Linh, Long Biên, Hà Nội',
    latitude: 21.0478,
    longitude: 105.8867,
    totalSpots: 120,
    pricePerHour: 13000,
    managerId: 2
  },
  {
    name: 'Bãi đỗ xe Trung tâm Thương mại Indochina Plaza',
    address: '241 Xuân Thủy, Cầu Giấy, Hà Nội',
    latitude: 21.0369,
    longitude: 105.7821,
    totalSpots: 160,
    pricePerHour: 14000,
    managerId: 2
  },
  
  // TRƯỜNG ĐẠI HỌC PHENIKAA
  {
    name: 'Bãi đỗ xe Trường Đại học Phenikaa',
    address: 'Yên Nghĩa, Hà Đông, Hà Nội',
    latitude: 20.9721,
    longitude: 105.7381,
    totalSpots: 4,
    pricePerHour: 8000,
    managerId: 2
  },
];

const seedParkingLots = async () => {
  try {
    // Tạo manager trước
    await createManagers();
    console.log('');

    // Xóa dữ liệu cũ theo thứ tự để tránh foreign key constraint
    console.log('Đang xóa dữ liệu cũ...');
    await db.execute('DELETE FROM payments');
    await db.execute('DELETE FROM parking_logs');
    await db.execute('DELETE FROM reservations');
    await db.execute('DELETE FROM parking_spots');
    await db.execute('DELETE FROM parking_lots');
    console.log('Đã xóa dữ liệu cũ');

    // Thêm dữ liệu bãi đỗ xe mới
    for (const lot of parkingLotsData) {
      const [result] = await db.execute(
        `INSERT INTO parking_lots (name, latitude, longitude, address, total_spots, price_per_hour, manager_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [lot.name, lot.latitude, lot.longitude, lot.address, lot.totalSpots, lot.pricePerHour, lot.managerId]
      );
      
      const lotId = result.insertId;
      
      // Tạo các chỗ đỗ xe cho bãi này
      for (let i = 1; i <= lot.totalSpots; i++) {
        await db.execute(
          `INSERT INTO parking_spots (lot_id, spot_number, spot_type, is_occupied, is_reserved)
           VALUES (?, ?, 'standard', 0, 0)`,
          [lotId, `A${i.toString().padStart(3, '0')}`]
        );
      }
      
      console.log(`Đã tạo bãi đỗ xe: ${lot.name} với ${lot.totalSpots} chỗ đỗ`);
    }

    console.log('Hoàn thành seed dữ liệu bãi đỗ xe');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedParkingLots();
