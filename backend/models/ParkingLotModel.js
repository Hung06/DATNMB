const db = require('../config/database');

class ParkingLot {
  // Lấy tất cả bãi đỗ xe
  static async getAll() {
    const query = `
      SELECT 
        pl.lot_id as id,
        pl.name,
        pl.address,
        pl.latitude,
        pl.longitude,
        pl.total_spots as totalSpots,
        CAST(pl.price_per_hour AS UNSIGNED) as pricePerHour,
        COUNT(ps.spot_id) as totalSpots,
        SUM(CASE WHEN ps.is_occupied = 0 AND ps.is_reserved = 0 THEN 1 ELSE 0 END) as availableSpots,
        u.full_name as managerName
      FROM parking_lots pl
      LEFT JOIN parking_spots ps ON pl.lot_id = ps.lot_id
      LEFT JOIN users u ON pl.manager_id = u.user_id
      GROUP BY pl.lot_id
      ORDER BY pl.name
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy bãi đỗ xe theo ID
  static async getById(id) {
    const query = `
      SELECT 
        pl.lot_id as id,
        pl.name,
        pl.address,
        pl.latitude,
        pl.longitude,
        pl.total_spots as totalSpots,
        CAST(pl.price_per_hour AS UNSIGNED) as pricePerHour,
        COUNT(ps.spot_id) as totalSpots,
        SUM(CASE WHEN ps.is_occupied = 0 AND ps.is_reserved = 0 THEN 1 ELSE 0 END) as availableSpots,
        u.full_name as managerName
      FROM parking_lots pl
      LEFT JOIN parking_spots ps ON pl.lot_id = ps.lot_id
      LEFT JOIN users u ON pl.manager_id = u.user_id
      WHERE pl.lot_id = ?
      GROUP BY pl.lot_id
    `;
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tìm bãi đỗ xe theo vị trí và bán kính
  static async findByLocation(latitude, longitude, radius = 10) {
    const query = `
      SELECT 
        pl.lot_id as id,
        pl.name,
        pl.address,
        pl.latitude,
        pl.longitude,
        pl.total_spots as totalSpots,
        CAST(pl.price_per_hour AS UNSIGNED) as pricePerHour,
        COUNT(ps.spot_id) as totalSpots,
        SUM(CASE WHEN ps.is_occupied = 0 AND ps.is_reserved = 0 THEN 1 ELSE 0 END) as availableSpots,
        u.full_name as managerName,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(pl.latitude)) * 
            cos(radians(pl.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(pl.latitude))
          )
        ) AS distance
      FROM parking_lots pl
      LEFT JOIN parking_spots ps ON pl.lot_id = ps.lot_id
      LEFT JOIN users u ON pl.manager_id = u.user_id
      GROUP BY pl.lot_id
      HAVING distance <= ?
      ORDER BY distance
    `;
    
    try {
      const [rows] = await db.execute(query, [latitude, longitude, latitude, radius]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm bãi đỗ xe
  static async search(searchTerm, minPrice, maxPrice, minSpots) {
    let query = `
      SELECT 
        pl.lot_id as id,
        pl.name,
        pl.address,
        pl.latitude,
        pl.longitude,
        pl.total_spots as totalSpots,
        CAST(pl.price_per_hour AS UNSIGNED) as pricePerHour,
        COUNT(ps.spot_id) as totalSpots,
        SUM(CASE WHEN ps.is_occupied = 0 AND ps.is_reserved = 0 THEN 1 ELSE 0 END) as availableSpots,
        u.full_name as managerName
      FROM parking_lots pl
      LEFT JOIN parking_spots ps ON pl.lot_id = ps.lot_id
      LEFT JOIN users u ON pl.manager_id = u.user_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (searchTerm) {
      query += ` AND (pl.name LIKE ? OR pl.address LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    if (minPrice !== undefined) {
      query += ` AND pl.price_per_hour >= ?`;
      params.push(minPrice);
    }
    
    if (maxPrice !== undefined) {
      query += ` AND pl.price_per_hour <= ?`;
      params.push(maxPrice);
    }
    
    query += ` GROUP BY pl.lot_id`;
    
    if (minSpots !== undefined) {
      query += ` HAVING availableSpots >= ?`;
      params.push(minSpots);
    }
    
    query += ` ORDER BY pl.name`;
    
    try {
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tạo bãi đỗ xe mới
  static async create(parkingLotData) {
    const query = `
      INSERT INTO parking_lots (name, latitude, longitude, address, total_spots, price_per_hour, manager_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      parkingLotData.name,
      parkingLotData.latitude,
      parkingLotData.longitude,
      parkingLotData.address,
      parkingLotData.totalSpots,
      parkingLotData.pricePerHour,
      parkingLotData.managerId
    ];
    
    try {
      const [result] = await db.execute(query, params);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật bãi đỗ xe
  static async update(id, parkingLotData) {
    const query = `
      UPDATE parking_lots 
      SET name = ?, latitude = ?, longitude = ?, address = ?, 
          total_spots = ?, price_per_hour = ?, manager_id = ?
      WHERE lot_id = ?
    `;
    
    const params = [
      parkingLotData.name,
      parkingLotData.latitude,
      parkingLotData.longitude,
      parkingLotData.address,
      parkingLotData.totalSpots,
      parkingLotData.pricePerHour,
      parkingLotData.managerId,
      id
    ];
    
    try {
      const [result] = await db.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa bãi đỗ xe
  static async delete(id) {
    const query = `DELETE FROM parking_lots WHERE lot_id = ?`;
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ParkingLot;
