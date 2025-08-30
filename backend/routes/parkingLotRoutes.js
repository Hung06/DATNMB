const express = require('express');
const router = express.Router();
const ParkingLotController = require('../controllers/ParkingLotController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/parking-lots', ParkingLotController.getAllParkingLots);
router.get('/parking-lots/search', ParkingLotController.searchParkingLots);
router.get('/parking-lots/:id', ParkingLotController.getParkingLotById);
router.get('/parking-lots/:id/debug', ParkingLotController.debugAvailableSpots);

// Protected routes (cần authentication)
router.post('/parking-lots', authMiddleware, ParkingLotController.createParkingLot);
router.put('/parking-lots/:id', authMiddleware, ParkingLotController.updateParkingLot);
router.delete('/parking-lots/:id', authMiddleware, ParkingLotController.deleteParkingLot);

module.exports = router;
