const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/ReservationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Routes cho user
router.get('/reservations', ReservationController.getUserReservations); // Lấy danh sách đặt chỗ của user
router.get('/reservations/:reservationId', ReservationController.getReservationDetail); // Lấy chi tiết đặt chỗ
router.post('/reservations', ReservationController.createReservation); // Tạo đặt chỗ mới
router.put('/reservations/:reservationId/cancel', ReservationController.cancelReservation); // Hủy đặt chỗ

// Routes cho admin/manager
router.get('/admin/reservations', ReservationController.getAllReservations); // Lấy tất cả đặt chỗ
router.get('/admin/reservations/parking-lot/:lotId', ReservationController.getReservationsByParkingLot); // Lấy đặt chỗ theo bãi đỗ xe
router.put('/admin/reservations/:reservationId/status', ReservationController.updateReservationStatus); // Cập nhật trạng thái đặt chỗ

// Routes cho admin
router.delete('/admin/reservations/:reservationId', ReservationController.deleteReservation); // Xóa đặt chỗ

module.exports = router;

