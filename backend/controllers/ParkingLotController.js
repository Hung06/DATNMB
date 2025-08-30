const ParkingLot = require('../models/ParkingLotModel');

// Lấy tất cả bãi đỗ xe
exports.getAllParkingLots = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    let parkingLots;
    
    // Nếu có tọa độ, tìm bãi đỗ xe trong bán kính
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const rad = parseFloat(radius);
      
      parkingLots = await ParkingLot.findByLocation(lat, lon, rad);
    } else {
      parkingLots = await ParkingLot.getAll();
    }
    
    res.json({
      success: true,
      data: parkingLots,
      count: parkingLots.length
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bãi đỗ xe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy bãi đỗ xe theo ID
exports.getParkingLotById = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.getById(req.params.id);
    
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bãi đỗ xe'
      });
    }
    
    res.json({
      success: true,
      data: parkingLot
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy bãi đỗ xe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Tạo bãi đỗ xe mới
exports.createParkingLot = async (req, res) => {
  try {
    const parkingLotId = await ParkingLot.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Tạo bãi đỗ xe thành công',
      data: { id: parkingLotId }
    });
    
  } catch (error) {
    console.error('Lỗi khi tạo bãi đỗ xe:', error);
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      error: error.message
    });
  }
};

// Cập nhật bãi đỗ xe
exports.updateParkingLot = async (req, res) => {
  try {
    const success = await ParkingLot.update(req.params.id, req.body);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bãi đỗ xe'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật bãi đỗ xe thành công'
    });
    
  } catch (error) {
    console.error('Lỗi khi cập nhật bãi đỗ xe:', error);
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      error: error.message
    });
  }
};

// Xóa bãi đỗ xe
exports.deleteParkingLot = async (req, res) => {
  try {
    const success = await ParkingLot.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bãi đỗ xe'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa bãi đỗ xe thành công'
    });
    
  } catch (error) {
    console.error('Lỗi khi xóa bãi đỗ xe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Tìm kiếm bãi đỗ xe
exports.searchParkingLots = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, minSpots } = req.query;
    
    const parkingLots = await ParkingLot.search(q, minPrice, maxPrice, minSpots);
    
    res.json({
      success: true,
      data: parkingLots,
      count: parkingLots.length
    });
    
  } catch (error) {
    console.error('Lỗi khi tìm kiếm bãi đỗ xe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Debug endpoint để kiểm tra available spots calculation
exports.debugAvailableSpots = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy dữ liệu từ spots API
    const ParkingSpot = require('../models/ParkingSpotModel');
    const spots = await ParkingSpot.getByLotId(id);
    
    // Tính toán manual
    const availableCount = spots.filter(spot => !spot.isOccupied && !spot.isReserved).length;
    
    // Lấy dữ liệu từ parking lot model
    const parkingLot = await ParkingLot.getById(id);
    
    res.json({
      success: true,
      data: {
        spotsData: spots,
        manualAvailableCount: availableCount,
        parkingLotData: parkingLot,
        comparison: {
          fromSpots: availableCount,
          fromParkingLot: parkingLot?.availableSpots || 0,
          match: availableCount === (parkingLot?.availableSpots || 0)
        }
      }
    });
    
  } catch (error) {
    console.error('Lỗi debug:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
