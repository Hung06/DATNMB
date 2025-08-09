const db = require('../config/database');

class ParkingSpot {
  // Lấy tất cả chỗ đỗ xe của một bãi đỗ xe
  static async getByLotId(lotId) {
    const query = `
      SELECT 
        ps.spot_id as spotId,
        ps.spot_number as spotNumber,
        ps.spot_type as spotType,
        ps.is_occupied as isOccupied,
        ps.is_reserved as isReserved,
        CAST(pl.price_per_hour AS UNSIGNED) as pricePerHour
      FROM parking_spots ps
      JOIN parking_lots pl ON ps.lot_id = pl.lot_id
      WHERE ps.lot_id = ?
      ORDER BY ps.spot_number
    `;
    
    try {
      const [rows] = await db.execute(query, [lotId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chỗ đỗ xe theo ID
  static async getById(spotId) {
    const query = `
      SELECT 
        ps.spot_id as spotId,
        ps.spot_number as spotNumber,
        ps.spot_type as spotType,
        ps.is_occupied as isOccupied,
        ps.is_reserved as isReserved,
        ps.lot_id as lotId,
        CAST(pl.price_per_hour AS UNSIGNED) as pricePerHour
      FROM parking_spots ps
      JOIN parking_lots pl ON ps.lot_id = pl.lot_id
      WHERE ps.spot_id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [spotId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái chỗ đỗ xe
  static async updateStatus(spotId, isOccupied, isReserved, reservedBy = null) {
    const query = `
      UPDATE parking_spots 
      SET is_occupied = ?, is_reserved = ?, reserved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE spot_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [isOccupied, isReserved, reservedBy, spotId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Đặt chỗ đỗ xe
  static async reserve(spotId, userId) {
    const query = `
      UPDATE parking_spots 
      SET is_reserved = 1, reserved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE spot_id = ? AND is_occupied = 0 AND is_reserved = 0
    `;
    
    try {
      const [result] = await db.execute(query, [userId, spotId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Hủy đặt chỗ
  static async cancelReservation(spotId) {
    const query = `
      UPDATE parking_spots 
      SET is_reserved = 0, reserved_by = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE spot_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [spotId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy số chỗ trống của một bãi đỗ xe
  static async getAvailableCount(lotId) {
    const query = `
      SELECT COUNT(*) as count
      FROM parking_spots 
      WHERE lot_id = ? AND is_occupied = 0 AND is_reserved = 0
    `;
    
    try {
      const [rows] = await db.execute(query, [lotId]);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ParkingSpot;
