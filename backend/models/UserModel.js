const db = require('../config/database');

const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  createUser: async ({ full_name, email, password, phone, license_plate }) => {
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password, phone, license_plate, role, created_at)
       VALUES (?, ?, ?, ?, ?, 'user', NOW())`,
      [full_name, email, password, phone || null, license_plate || null]
    );
    return result.insertId;
  }
};

module.exports = UserModel;
