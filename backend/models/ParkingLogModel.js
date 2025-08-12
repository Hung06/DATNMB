const db = require('../config/database');

class ParkingLog {
  // Lấy lịch sử đỗ xe của một user
  static async getByUserId(userId) {
    const query = `
      SELECT 
        pl.log_id,
        pl.entry_time,
        pl.exit_time,
        pl.total_minutes,
        pl.fee,
        pl.status,
        ps.spot_number,
        pkl.name as parking_lot_name,
        pkl.address as parking_lot_address,
        p.payment_id,
        p.amount as paid_amount,
        p.method as payment_method,
        p.paid_at
      FROM parking_logs pl
      LEFT JOIN parking_spots ps ON pl.spot_id = ps.spot_id
      LEFT JOIN parking_lots pkl ON ps.lot_id = pkl.lot_id
      LEFT JOIN payments p ON pl.log_id = p.log_id
      WHERE pl.user_id = ?
      ORDER BY pl.entry_time DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết một log đỗ xe
  static async getById(logId) {
    const query = `
      SELECT 
        pl.log_id,
        pl.user_id,
        pl.spot_id,
        pl.entry_time,
        pl.exit_time,
        pl.total_minutes,
        pl.fee,
        pl.status,
        ps.spot_number,
        pkl.name as parking_lot_name,
        pkl.address as parking_lot_address,
        p.payment_id,
        p.amount as paid_amount,
        p.method as payment_method,
        p.paid_at
      FROM parking_logs pl
      LEFT JOIN parking_spots ps ON pl.spot_id = ps.spot_id
      LEFT JOIN parking_lots pkl ON ps.lot_id = pkl.lot_id
      LEFT JOIN payments p ON pl.log_id = p.log_id
      WHERE pl.log_id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [logId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo log đỗ xe mới (khi vào bãi)
  static async createEntry(userId, spotId) {
    const query = `
      INSERT INTO parking_logs (user_id, spot_id, entry_time, status)
      VALUES (?, ?, NOW(), 'in')
    `;
    
    try {
      const [result] = await db.execute(query, [userId, spotId]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật log khi ra bãi
  static async updateExit(logId, totalMinutes, fee) {
    const query = `
      UPDATE parking_logs 
      SET exit_time = NOW(), 
          total_minutes = ?, 
          fee = ?, 
          status = 'out'
      WHERE log_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [totalMinutes, fee, logId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả logs (cho admin/manager)
  static async getAll() {
    const query = `
      SELECT 
        pl.log_id,
        pl.user_id,
        pl.spot_id,
        pl.entry_time,
        pl.exit_time,
        pl.total_minutes,
        pl.fee,
        pl.status,
        ps.spot_number,
        pkl.name as parking_lot_name,
        pkl.address as parking_lot_address,
        u.full_name as user_name,
        u.license_plate,
        p.payment_id,
        p.amount as paid_amount,
        p.method as payment_method,
        p.paid_at
      FROM parking_logs pl
      LEFT JOIN parking_spots ps ON pl.spot_id = ps.spot_id
      LEFT JOIN parking_lots pkl ON ps.lot_id = pkl.lot_id
      LEFT JOIN users u ON pl.user_id = u.user_id
      LEFT JOIN payments p ON pl.log_id = p.log_id
      ORDER BY pl.entry_time DESC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy logs theo bãi đỗ xe
  static async getByParkingLot(lotId) {
    const query = `
      SELECT 
        pl.log_id,
        pl.user_id,
        pl.spot_id,
        pl.entry_time,
        pl.exit_time,
        pl.total_minutes,
        pl.fee,
        pl.status,
        ps.spot_number,
        pkl.name as parking_lot_name,
        pkl.address as parking_lot_address,
        u.full_name as user_name,
        u.license_plate,
        p.payment_id,
        p.amount as paid_amount,
        p.method as payment_method,
        p.paid_at
      FROM parking_logs pl
      LEFT JOIN parking_spots ps ON pl.spot_id = ps.spot_id
      LEFT JOIN parking_lots pkl ON ps.lot_id = pkl.lot_id
      LEFT JOIN users u ON pl.user_id = u.user_id
      LEFT JOIN payments p ON pl.log_id = p.log_id
      WHERE pkl.lot_id = ?
      ORDER BY pl.entry_time DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [lotId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ParkingLog;

