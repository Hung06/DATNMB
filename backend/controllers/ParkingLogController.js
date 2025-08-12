const ParkingLog = require('../models/ParkingLogModel');

class ParkingLogController {
  // Lấy lịch sử đỗ xe của user hiện tại
  static async getUserHistory(req, res) {
    try {
      const userId = req.user.user_id;
      const history = await ParkingLog.getByUserId(userId);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error getting user history:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử đỗ xe',
        error: error.message
      });
    }
  }

  // Lấy chi tiết một log đỗ xe
  static async getLogDetail(req, res) {
    try {
      const { logId } = req.params;
      const log = await ParkingLog.getById(logId);
      
      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch sử đỗ xe'
        });
      }
      
      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Error getting log detail:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy chi tiết lịch sử đỗ xe',
        error: error.message
      });
    }
  }

  // Tạo log đỗ xe mới (khi vào bãi)
  static async createEntry(req, res) {
    try {
      const userId = req.user.user_id;
      const { spotId } = req.body;
      
      if (!spotId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin chỗ đỗ xe'
        });
      }
      
      const logId = await ParkingLog.createEntry(userId, spotId);
      
      res.json({
        success: true,
        message: 'Đã tạo log đỗ xe thành công',
        data: { logId }
      });
    } catch (error) {
      console.error('Error creating entry log:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo log đỗ xe',
        error: error.message
      });
    }
  }

  // Cập nhật log khi ra bãi
  static async updateExit(req, res) {
    try {
      const { logId } = req.params;
      const { totalMinutes, fee } = req.body;
      
      if (!totalMinutes || !fee) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin thời gian hoặc phí'
        });
      }
      
      const success = await ParkingLog.updateExit(logId, totalMinutes, fee);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy log đỗ xe'
        });
      }
      
      res.json({
        success: true,
        message: 'Đã cập nhật log đỗ xe thành công'
      });
    } catch (error) {
      console.error('Error updating exit log:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật log đỗ xe',
        error: error.message
      });
    }
  }

  // Lấy tất cả logs (cho admin/manager)
  static async getAllLogs(req, res) {
    try {
      // Kiểm tra quyền admin hoặc manager
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }
      
      const logs = await ParkingLog.getAll();
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting all logs:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách logs',
        error: error.message
      });
    }
  }

  // Lấy logs theo bãi đỗ xe (cho manager)
  static async getLogsByParkingLot(req, res) {
    try {
      const { lotId } = req.params;
      
      // Kiểm tra quyền manager của bãi đỗ xe này
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }
      
      const logs = await ParkingLog.getByParkingLot(lotId);
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting logs by parking lot:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy logs theo bãi đỗ xe',
        error: error.message
      });
    }
  }
}

module.exports = ParkingLogController;

