const db = require('../config/database');

class Reservation {
  // Lấy tất cả đặt chỗ của một user
  static async getByUserId(userId) {
    const query = `
      SELECT 
        r.reservation_id,
        r.reserved_at,
        r.expected_start,
        r.expected_end,
        r.status,
        ps.spot_number,
        ps.spot_type,
        pl.name as parking_lot_name,
        pl.address as parking_lot_address,
        pl.price_per_hour
      FROM reservations r
      LEFT JOIN parking_spots ps ON r.spot_id = ps.spot_id
      LEFT JOIN parking_lots pl ON ps.lot_id = pl.lot_id
      WHERE r.user_id = ?
      ORDER BY r.reserved_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết một đặt chỗ
  static async getById(reservationId) {
    const query = `
      SELECT 
        r.reservation_id,
        r.user_id,
        r.spot_id,
        r.reserved_at,
        r.expected_start,
        r.expected_end,
        r.status,
        ps.spot_number,
        ps.spot_type,
        pl.name as parking_lot_name,
        pl.address as parking_lot_address,
        pl.price_per_hour,
        u.full_name as user_name,
        u.email as user_email,
        u.license_plate
      FROM reservations r
      LEFT JOIN parking_spots ps ON r.spot_id = ps.spot_id
      LEFT JOIN parking_lots pl ON ps.lot_id = pl.lot_id
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.reservation_id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [reservationId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Tạo đặt chỗ mới
  static async create(reservationData) {
    const query = `
      INSERT INTO reservations (user_id, spot_id, reserved_at, expected_start, expected_end, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [
        reservationData.user_id,
        reservationData.spot_id,
        reservationData.reserved_at,
        reservationData.expected_start,
        reservationData.expected_end,
        reservationData.status || 'pending'
      ]);
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái đặt chỗ
  static async updateStatus(reservationId, status) {
    const query = `
      UPDATE reservations 
      SET status = ?
      WHERE reservation_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [status, reservationId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Hủy đặt chỗ
  static async cancel(reservationId, userId) {
    const query = `
      UPDATE reservations 
      SET status = 'cancelled'
      WHERE reservation_id = ? AND user_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [reservationId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa đặt chỗ (cho admin)
  static async delete(reservationId) {
    const query = `
      DELETE FROM reservations 
      WHERE reservation_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [reservationId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả đặt chỗ (cho admin/manager)
  static async getAll() {
    const query = `
      SELECT 
        r.reservation_id,
        r.reserved_at,
        r.expected_start,
        r.expected_end,
        r.status,
        ps.spot_number,
        ps.spot_type,
        pl.name as parking_lot_name,
        pl.address as parking_lot_address,
        u.full_name as user_name,
        u.email as user_email,
        u.license_plate
      FROM reservations r
      LEFT JOIN parking_spots ps ON r.spot_id = ps.spot_id
      LEFT JOIN parking_lots pl ON ps.lot_id = pl.lot_id
      LEFT JOIN users u ON r.user_id = u.user_id
      ORDER BY r.reserved_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy đặt chỗ theo bãi đỗ xe (cho manager)
  static async getByParkingLot(lotId) {
    const query = `
      SELECT 
        r.reservation_id,
        r.reserved_at,
        r.expected_start,
        r.expected_end,
        r.status,
        ps.spot_number,
        ps.spot_type,
        pl.name as parking_lot_name,
        pl.address as parking_lot_address,
        u.full_name as user_name,
        u.email as user_email,
        u.license_plate
      FROM reservations r
      LEFT JOIN parking_spots ps ON r.spot_id = ps.spot_id
      LEFT JOIN parking_lots pl ON ps.lot_id = pl.lot_id
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE pl.lot_id = ?
      ORDER BY r.reserved_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [lotId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem chỗ đỗ xe có bị trùng lịch không
  static async checkConflict(spotId, expectedStart, expectedEnd, excludeReservationId = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE spot_id = ? 
        AND status IN ('pending', 'confirmed')
        AND (
          (expected_start <= ? AND expected_end >= ?) OR
          (expected_start <= ? AND expected_end >= ?) OR
          (expected_start >= ? AND expected_end <= ?)
        )
    `;
    
    const params = [spotId, expectedStart, expectedStart, expectedEnd, expectedEnd, expectedStart, expectedEnd];
    
    if (excludeReservationId) {
      query += ' AND reservation_id != ?';
      params.push(excludeReservationId);
    }
    
    try {
      const [rows] = await db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Reservation;

