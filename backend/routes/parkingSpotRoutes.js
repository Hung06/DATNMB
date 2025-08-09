const express = require('express');
const router = express.Router();
const ParkingSpotController = require('../controllers/ParkingSpotController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/parking-lots/:lotId/spots', ParkingSpotController.getSpotsByLotId);
router.get('/parking-spots/:spotId', ParkingSpotController.getSpotById);

// Protected routes (cần authentication)
router.post('/parking-spots/:spotId/reserve', authMiddleware, ParkingSpotController.reserveSpot);
router.delete('/parking-spots/:spotId/reserve', authMiddleware, ParkingSpotController.cancelReservation);
router.put('/parking-spots/:spotId/status', authMiddleware, ParkingSpotController.updateSpotStatus);

module.exports = router;
