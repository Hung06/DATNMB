const ParkingSpot = require('../models/ParkingSpotModel');

class ParkingSpotController {
  // Lấy danh sách chỗ đỗ xe của một bãi đỗ xe
  static async getSpotsByLotId(req, res) {
    try {
      const { lotId } = req.params;
      const spots = await ParkingSpot.getByLotId(lotId);
      
      res.json({
        success: true,
        count: spots.length,
        data: spots
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chỗ đỗ xe:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách chỗ đỗ xe'
      });
    }
  }

  // Lấy thông tin chỗ đỗ xe theo ID
  static async getSpotById(req, res) {
    try {
      const { spotId } = req.params;
      const spot = await ParkingSpot.getById(spotId);
      
      if (!spot) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chỗ đỗ xe'
        });
      }
      
      res.json({
        success: true,
        data: spot
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chỗ đỗ xe:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thông tin chỗ đỗ xe'
      });
    }
  }

  // Đặt chỗ đỗ xe
  static async reserveSpot(req, res) {
    try {
      const { spotId } = req.params;
      const userId = req.user.user_id; // Từ JWT token
      
      const success = await ParkingSpot.reserve(spotId, userId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Chỗ đỗ xe không khả dụng hoặc đã được đặt'
        });
      }
      
      res.json({
        success: true,
        message: 'Đặt chỗ thành công'
      });
    } catch (error) {
      console.error('Lỗi khi đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đặt chỗ'
      });
    }
  }

  // Hủy đặt chỗ
  static async cancelReservation(req, res) {
    try {
      const { spotId } = req.params;
      const userId = req.user.user_id; // Từ JWT token
      
      const success = await ParkingSpot.cancelReservation(spotId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đặt chỗ'
        });
      }
      
      res.json({
        success: true,
        message: 'Hủy đặt chỗ thành công'
      });
    } catch (error) {
      console.error('Lỗi khi hủy đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi hủy đặt chỗ'
      });
    }
  }

  // Cập nhật trạng thái chỗ đỗ xe (cho admin/manager)
  static async updateSpotStatus(req, res) {
    try {
      const { spotId } = req.params;
      const { isOccupied, isReserved, reservedBy } = req.body;
      
      const success = await ParkingSpot.updateStatus(spotId, isOccupied, isReserved, reservedBy);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Không thể cập nhật trạng thái chỗ đỗ xe'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công'
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái chỗ đỗ xe:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật trạng thái'
      });
    }
  }
}

module.exports = ParkingSpotController;
