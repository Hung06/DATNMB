const UserModel = require('../models/UserModel');
const ParkingLog = require('../models/ParkingLogModel');
const ParkingSpot = require('../models/ParkingSpotModel');
const axios = require('axios');

class LicensePlateController {
  // Kiểm tra biển số và xử lý xe vào bãi
  static async processVehicleEntry(req, res) {
    try {
      const { license_plate } = req.body;
      
      if (!license_plate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin biển số xe'
        });
      }

      // Tìm user theo biển số
      const user = await UserModel.findByLicensePlate(license_plate);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Biển số không tồn tại trong hệ thống',
          is_allowed: false
        });
      }

      // Kiểm tra xem user có đang đỗ xe không
      const activeLog = await ParkingLog.getActiveByUserId(user.user_id);
      
      if (activeLog) {
        return res.status(400).json({
          success: false,
          message: 'Xe đã đang đỗ trong bãi',
          is_allowed: false
        });
      }

      // Tìm chỗ đỗ xe trống
      const availableSpot = await ParkingSpot.findAvailableSpot();
      
      if (!availableSpot) {
        return res.status(400).json({
          success: false,
          message: 'Không có chỗ đỗ xe trống',
          is_allowed: false
        });
      }

      // Tạo log đỗ xe trước
      const logId = await ParkingLog.createEntry(user.user_id, availableSpot.spotId);

      // Gửi tín hiệu mở cổng cho ESP32
      const gateOpened = await LicensePlateController.sendGateSignalToESP32({
        license_plate,
        user_id: user.user_id,
        user_name: user.full_name,
        user_email: user.email,
        action: 'open_gate_entry',
        spot_id: availableSpot.spotId,
        log_id: logId
      });

      if (!gateOpened) {
        return res.status(500).json({
          success: false,
          message: 'Không thể mở cổng',
          is_allowed: false
        });
      }

      // Cập nhật trạng thái chỗ đỗ xe
      await ParkingSpot.updateStatus(availableSpot.spotId, true, false);

      res.json({
        success: true,
        message: 'Xe được phép vào bãi',
        is_allowed: true,
        gate_opened: true,
        data: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            license_plate: user.license_plate
          },
          spot: {
            spot_id: availableSpot.spotId,
            spot_number: availableSpot.spotNumber
          },
          log_id: logId
        }
      });

    } catch (error) {
      console.error('Error processing vehicle entry:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý xe vào bãi',
        error: error.message
      });
    }
  }

  // Xử lý xe ra bãi
  static async processVehicleExit(req, res) {
    try {
      const { license_plate } = req.body;
      
      if (!license_plate) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin biển số xe'
        });
      }

      // Tìm user theo biển số
      const user = await UserModel.findByLicensePlate(license_plate);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Biển số không tồn tại trong hệ thống',
          is_allowed: false
        });
      }

      // Tìm log đỗ xe đang hoạt động
      const activeLog = await ParkingLog.getActiveByUserId(user.user_id);
      
      if (!activeLog) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy xe đang đỗ trong bãi',
          is_allowed: false
        });
      }

      // Tính phí đỗ xe
      const entryTime = new Date(activeLog.entry_time);
      const exitTime = new Date();
      const totalMinutes = Math.ceil((exitTime - entryTime) / (1000 * 60));
      const totalHours = totalMinutes / 60;
      
      // Lấy giá theo giờ từ parking lot
      const spot = await ParkingSpot.getById(activeLog.spot_id);
      const pricePerHour = spot.pricePerHour || 5000; // Default 5000 VND/hour
      
      // Tính phí (làm tròn lên)
      const fee = Math.ceil(totalHours * pricePerHour);

      // Gửi tín hiệu mở cổng cho ESP32
      const gateOpened = await LicensePlateController.sendGateSignalToESP32({
        license_plate,
        user_id: user.user_id,
        user_name: user.full_name,
        user_email: user.email,
        action: 'open_gate_exit',
        log_id: activeLog.log_id,
        fee: fee,
        total_minutes: totalMinutes
      });

      if (!gateOpened) {
        return res.status(500).json({
          success: false,
          message: 'Không thể mở cổng',
          is_allowed: false
        });
      }

      // Cập nhật log đỗ xe
      await ParkingLog.updateExit(activeLog.log_id, totalMinutes, fee);

      // Cập nhật trạng thái chỗ đỗ xe
      await ParkingSpot.updateStatus(activeLog.spot_id, false, false);

      res.json({
        success: true,
        message: 'Xe được phép ra bãi',
        is_allowed: true,
        gate_opened: true,
        data: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            license_plate: user.license_plate
          },
          parking_info: {
            log_id: activeLog.log_id,
            spot_number: activeLog.spot_number,
            entry_time: activeLog.entry_time,
            exit_time: exitTime,
            total_minutes: totalMinutes,
            total_hours: totalHours,
            fee: fee,
            price_per_hour: pricePerHour
          }
        }
      });

    } catch (error) {
      console.error('Error processing vehicle exit:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý xe ra bãi',
        error: error.message
      });
    }
  }

  // Xác nhận xe đã vào slot (từ ESP32)
  static async confirmVehicleInSlot(req, res) {
    try {
      const { log_id, spot_id, distance } = req.body;
      
      if (!log_id || !spot_id || !distance) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin cần thiết'
        });
      }

      // Kiểm tra khoảng cách HC-SR04 (5-8cm)
      if (distance >= 5 && distance <= 8) {
        // Xác nhận xe đã vào slot
        await ParkingLog.confirmEntry(log_id);
        
        res.json({
          success: true,
          message: 'Xác nhận xe đã vào slot thành công',
          confirmed: true
        });
      } else {
        res.json({
          success: false,
          message: 'Khoảng cách không phù hợp, xe chưa vào slot',
          confirmed: false,
          distance: distance
        });
      }

    } catch (error) {
      console.error('Error confirming vehicle in slot:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xác nhận xe vào slot',
        error: error.message
      });
    }
  }

  // Gửi tín hiệu đến ESP32
  static async sendGateSignalToESP32(data) {
    try {
      const ESP32_IP = process.env.ESP32_IP || '192.168.0.108';
      const ESP32_PORT = process.env.ESP32_PORT || 80;
      const ESP32_ENDPOINT = `http://${ESP32_IP}:${ESP32_PORT}/backend_signal`;

      const response = await axios.post(ESP32_ENDPOINT, data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        console.log('✅ Gate signal sent to ESP32 successfully');
        return true;
      } else {
        console.log('❌ Failed to send gate signal to ESP32');
        return false;
      }

    } catch (error) {
      console.error('❌ Error sending gate signal to ESP32:', error.message);
      return false;
    }
  }

  // Lấy trạng thái hệ thống (cho ESP32)
  static async getSystemStatus(req, res) {
    try {
      const availableSpots = await ParkingSpot.getAvailableCount(1); // Default lot_id = 1
      const totalSpots = await ParkingSpot.getTotalCount(1);
      
      res.json({
        success: true,
        data: {
          available_spots: availableSpots,
          total_spots: totalSpots,
          system_status: 'active',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting system status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy trạng thái hệ thống',
        error: error.message
      });
    }
  }
}

module.exports = LicensePlateController;
