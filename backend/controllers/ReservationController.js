const Reservation = require('../models/ReservationModel');
const ParkingSpot = require('../models/ParkingSpotModel');

class ReservationController {
  // Lấy danh sách đặt chỗ của user hiện tại
  static async getUserReservations(req, res) {
    try {
      const userId = req.user.user_id;
      const reservations = await Reservation.getByUserId(userId);
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách đặt chỗ'
      });
    }
  }

  // Lấy chi tiết một đặt chỗ
  static async getReservationDetail(req, res) {
    try {
      const { reservationId } = req.params;
      const userId = req.user.user_id;
      
      const reservation = await Reservation.getById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đặt chỗ'
        });
      }

      // Kiểm tra quyền truy cập (chỉ user sở hữu hoặc admin/manager mới xem được)
      if (reservation.user_id !== userId && req.user.role === 'user') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập đặt chỗ này'
        });
      }
      
      res.json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy chi tiết đặt chỗ'
      });
    }
  }

  // Tạo đặt chỗ mới
  static async createReservation(req, res) {
    try {
      const userId = req.user.user_id;
      const { spotId, expectedStart, expectedEnd, depositAmount, paymentMethod } = req.body;

      // Validate input
      if (!spotId || !expectedStart || !expectedEnd) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: spotId, expectedStart, expectedEnd'
        });
      }

      // Kiểm tra chỗ đỗ xe có tồn tại và khả dụng không
      const spot = await ParkingSpot.getById(spotId);
      if (!spot) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chỗ đỗ xe'
        });
      }

      if (spot.is_occupied) {
        return res.status(400).json({
          success: false,
          message: 'Chỗ đỗ xe đã được sử dụng'
        });
      }

      if (spot.is_reserved) {
        return res.status(400).json({
          success: false,
          message: 'Chỗ đỗ xe đã được đặt trước'
        });
      }

      // Kiểm tra xung đột lịch đặt chỗ
      const hasConflict = await Reservation.checkConflict(spotId, expectedStart, expectedEnd);
      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Chỗ đỗ xe đã được đặt trong khoảng thời gian này'
        });
      }

      // Tạo đặt chỗ
      const reservationData = {
        user_id: userId,
        spot_id: spotId,
        reserved_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        expected_start: expectedStart,
        expected_end: expectedEnd,
        status: 'pending'
      };

      const reservationId = await Reservation.create(reservationData);

      // Cập nhật trạng thái chỗ đỗ xe
      await ParkingSpot.updateStatus(spotId, false, true, userId);

      res.json({
        success: true,
        message: 'Đặt chỗ thành công',
        data: {
          reservationId,
          depositAmount,
          paymentMethod
        }
      });
    } catch (error) {
      console.error('Lỗi khi tạo đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đặt chỗ'
      });
    }
  }

  // Cập nhật trạng thái đặt chỗ (cho admin/manager)
  static async updateReservationStatus(req, res) {
    try {
      const { reservationId } = req.params;
      const { status } = req.body;

      // Kiểm tra quyền (chỉ admin/manager)
      if (req.user.role === 'user') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền cập nhật trạng thái đặt chỗ'
        });
      }

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }

      const success = await Reservation.updateStatus(reservationId, status);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đặt chỗ'
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công'
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật trạng thái đặt chỗ'
      });
    }
  }

  // Hủy đặt chỗ
  static async cancelReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const userId = req.user.user_id;

      const reservation = await Reservation.getById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đặt chỗ'
        });
      }

      // Kiểm tra quyền (chỉ user sở hữu hoặc admin/manager)
      if (reservation.user_id !== userId && req.user.role === 'user') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền hủy đặt chỗ này'
        });
      }

      const success = await Reservation.cancel(reservationId, userId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đặt chỗ'
        });
      }

      // Cập nhật trạng thái chỗ đỗ xe
      await ParkingSpot.updateStatus(reservation.spot_id, false, false, null);

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

  // Xóa đặt chỗ (cho admin)
  static async deleteReservation(req, res) {
    try {
      const { reservationId } = req.params;

      // Kiểm tra quyền (chỉ admin)
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ admin mới có quyền xóa đặt chỗ'
        });
      }

      const success = await Reservation.delete(reservationId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đặt chỗ'
        });
      }

      res.json({
        success: true,
        message: 'Xóa đặt chỗ thành công'
      });
    } catch (error) {
      console.error('Lỗi khi xóa đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa đặt chỗ'
      });
    }
  }

  // Lấy tất cả đặt chỗ (cho admin/manager)
  static async getAllReservations(req, res) {
    try {
      // Kiểm tra quyền (chỉ admin/manager)
      if (req.user.role === 'user') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xem tất cả đặt chỗ'
        });
      }

      const reservations = await Reservation.getAll();
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });
    } catch (error) {
      console.error('Lỗi khi lấy tất cả đặt chỗ:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy tất cả đặt chỗ'
      });
    }
  }

  // Lấy đặt chỗ theo bãi đỗ xe (cho manager)
  static async getReservationsByParkingLot(req, res) {
    try {
      const { lotId } = req.params;

      // Kiểm tra quyền (chỉ admin/manager)
      if (req.user.role === 'user') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xem đặt chỗ theo bãi đỗ xe'
        });
      }

      const reservations = await Reservation.getByParkingLot(lotId);
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });
    } catch (error) {
      console.error('Lỗi khi lấy đặt chỗ theo bãi đỗ xe:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đặt chỗ theo bãi đỗ xe'
      });
    }
  }
}

module.exports = ReservationController;

