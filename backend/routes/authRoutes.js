// File: backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route đăng ký
router.post('/auth/register', AuthController.register);

// Route đăng nhập
router.post('/auth/login', AuthController.login);

// Route đăng nhập với Google
router.post('/auth/google', AuthController.googleLogin);

// Route logout
router.post('/auth/logout', AuthController.logout);

// Route lấy thông tin profile (cần authentication)
router.get('/auth/profile', authMiddleware, AuthController.getProfile);

// Route cập nhật thông tin profile (cần authentication)
router.put('/auth/profile', authMiddleware, AuthController.updateProfile);

module.exports = router;
