// File: backend/controllers/AuthController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = require('../config/database'); 
const AuthController = {
  register: async (req, res) => {
    try {
      const { full_name, email, password, phone, license_plate } = req.body;

      if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await UserModel.createUser({
        full_name,
        email,
        password: hashedPassword,
        phone,
        license_plate,
      });

      res.status(201).json({ message: 'Đăng ký thành công', user_id: userId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server', error });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
      }

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          license_plate: user.license_plate,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server', error });
    }
  },

  logout: (req, res) => {
    // Xoá token trên client (thực hiện ở frontend)
    res.json({ message: 'Đăng xuất thành công' });
  },

  // Lấy thông tin profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const [rows] = await db.execute(
        'SELECT user_id, full_name, email, phone, license_plate, role, created_at FROM users WHERE user_id = ?',
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }

      const user = rows[0];
      res.json({
        data: {
          id: user.user_id,
          name: user.full_name,
          email: user.email,
          phone: user.phone || '',
          address: user.license_plate || '', // Sử dụng license_plate làm address tạm thời
          role: user.role,
          createdAt: user.created_at,
        }
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Cập nhật thông tin profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { name, phone, address } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Vui lòng nhập họ tên' });
      }

      const [result] = await db.execute(
        'UPDATE users SET full_name = ?, phone = ?, license_plate = ? WHERE user_id = ?',
        [name.trim(), phone || '', address || '', userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
      }

      // Lấy thông tin user đã cập nhật
      const [rows] = await db.execute(
        'SELECT user_id, full_name, email, phone, license_plate, role, created_at FROM users WHERE user_id = ?',
        [userId]
      );

      const user = rows[0];
      res.json({
        message: 'Cập nhật thông tin thành công',
        data: {
          id: user.user_id,
          name: user.full_name,
          email: user.email,
          phone: user.phone || '',
          address: user.license_plate || '',
          role: user.role,
          createdAt: user.created_at,
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },
};
    
const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Missing idToken' });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // console.log('Google payload:', payload);

    const email = payload.email;
    const full_name = payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim();

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    // console.log('Rows found:', rows);

    let user;
    let needsProfileUpdate = false;
    
    if (rows.length === 0) {
      // User mới, cần cập nhật thông tin
      const [result] = await db.execute(
        'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        [full_name, email, '', 'user']
      );
      console.log('Insert result:', result);
      const [newRows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
      user = newRows[0];
      needsProfileUpdate = true;
    } else {
      user = rows[0];
      // Kiểm tra xem user có đầy đủ thông tin không
      if (!user.phone || !user.license_plate || !user.full_name || user.full_name.trim() === '') {
        needsProfileUpdate = true;
      }
    }

    console.log('User to respond:', user);

    const token = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Sending token to frontend:', token);

    res.json({ 
      token, 
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        license_plate: user.license_plate || '',
        role: user.role,
        created_at: user.created_at,
      },
      needsProfileUpdate 
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

module.exports = {
  ...AuthController,
  googleLogin,
};