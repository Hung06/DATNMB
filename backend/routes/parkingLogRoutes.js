const express = require('express');
const router = express.Router();
const ParkingLogController = require('../controllers/ParkingLogController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả routes đều yêu cầu authentication
router.use(authMiddleware);

// Lấy lịch sử đỗ xe của user hiện tại
router.get('/history', ParkingLogController.getUserHistory);

// Lấy chi tiết một log đỗ xe
router.get('/:logId', ParkingLogController.getLogDetail);

// Tạo log đỗ xe mới (khi vào bãi)
router.post('/entry', ParkingLogController.createEntry);

// Cập nhật log khi ra bãi
router.put('/:logId/exit', ParkingLogController.updateExit);

// Lấy tất cả logs (cho admin/manager)
router.get('/admin/all', ParkingLogController.getAllLogs);

// Lấy logs theo bãi đỗ xe (cho manager)
router.get('/admin/parking-lot/:lotId', ParkingLogController.getLogsByParkingLot);

module.exports = router;

