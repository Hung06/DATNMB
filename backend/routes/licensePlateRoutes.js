const express = require('express');
const router = express.Router();
const LicensePlateController = require('../controllers/LicensePlateController');

// API endpoints cho License Plate Recognition
router.post('/vehicle-entry', LicensePlateController.processVehicleEntry);
router.post('/vehicle-exit', LicensePlateController.processVehicleExit);
router.post('/confirm-slot', LicensePlateController.confirmVehicleInSlot);
router.get('/system-status', LicensePlateController.getSystemStatus);

module.exports = router;
