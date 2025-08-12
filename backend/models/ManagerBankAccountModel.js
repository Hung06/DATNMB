const db = require('../config/database');

class ManagerBankAccount {
  // Lấy tất cả tài khoản ngân hàng của một manager
  static async getByUserId(userId) {
    const query = `
      SELECT 
        mba.account_id,
        mba.user_id,
        mba.bank_code,
        mba.bank_name,
        mba.account_number,
        mba.account_name,
        mba.is_active,
        mba.created_at,
        mba.updated_at,
        u.full_name as manager_name,
        u.email as manager_email
      FROM manager_bank_accounts mba
      LEFT JOIN users u ON mba.user_id = u.user_id
      WHERE mba.user_id = ? AND mba.is_active = TRUE
      ORDER BY mba.created_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết một tài khoản ngân hàng
  static async getById(accountId) {
    const query = `
      SELECT 
        mba.account_id,
        mba.user_id,
        mba.bank_code,
        mba.bank_name,
        mba.account_number,
        mba.account_name,
        mba.is_active,
        mba.created_at,
        mba.updated_at,
        u.full_name as manager_name,
        u.email as manager_email
      FROM manager_bank_accounts mba
      LEFT JOIN users u ON mba.user_id = u.user_id
      WHERE mba.account_id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [accountId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo tài khoản ngân hàng mới
  static async create(bankAccountData) {
    const query = `
      INSERT INTO manager_bank_accounts 
      (user_id, bank_code, bank_name, account_number, account_name, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [
        bankAccountData.user_id,
        bankAccountData.bank_code,
        bankAccountData.bank_name,
        bankAccountData.account_number,
        bankAccountData.account_name,
        bankAccountData.is_active !== undefined ? bankAccountData.is_active : true
      ]);
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật tài khoản ngân hàng
  static async update(accountId, updateData) {
    const query = `
      UPDATE manager_bank_accounts 
      SET bank_code = ?, bank_name = ?, account_number = ?, account_name = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE account_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [
        updateData.bank_code,
        updateData.bank_name,
        updateData.account_number,
        updateData.account_name,
        updateData.is_active !== undefined ? updateData.is_active : true,
        accountId
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa tài khoản ngân hàng (soft delete)
  static async delete(accountId) {
    const query = `
      UPDATE manager_bank_accounts 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE account_id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [accountId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả tài khoản ngân hàng (cho admin)
  static async getAll() {
    const query = `
      SELECT 
        mba.account_id,
        mba.user_id,
        mba.bank_code,
        mba.bank_name,
        mba.account_number,
        mba.account_name,
        mba.is_active,
        mba.created_at,
        mba.updated_at,
        u.full_name as manager_name,
        u.email as manager_email,
        u.role as user_role
      FROM manager_bank_accounts mba
      LEFT JOIN users u ON mba.user_id = u.user_id
      WHERE u.role = 'manager'
      ORDER BY mba.created_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem tài khoản đã tồn tại chưa
  static async checkExists(userId, bankCode, accountNumber, excludeAccountId = null) {
    let query = `
      SELECT COUNT(*) as count 
      FROM manager_bank_accounts 
      WHERE user_id = ? AND bank_code = ? AND account_number = ?
    `;
    
    const params = [userId, bankCode, accountNumber];
    
    if (excludeAccountId) {
      query += ' AND account_id != ?';
      params.push(excludeAccountId);
    }
    
    try {
      const [rows] = await db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách mã ngân hàng theo chuẩn VietQR
  static getVietQRBankCodes() {
    return [
      { code: '970436', name: 'Ngân hàng TMCP Tiên Phong (TPBank)' },
      { code: '970403', name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)' },
      { code: '970400', name: 'Ngân hàng TMCP Sài Gòn Công Thương (Saigonbank)' },
      { code: '970416', name: 'Ngân hàng TMCP Hàng Hải Việt Nam (MSB)' },
      { code: '970415', name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)' },
      { code: '970414', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)' },
      { code: '970405', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)' },
      { code: '970406', name: 'Ngân hàng TMCP Phát triển TP.HCM (HDBank)' },
      { code: '970407', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)' },
      { code: '970408', name: 'Ngân hàng TMCP Quân đội (MB Bank)' },
      { code: '970409', name: 'Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)' },
      { code: '970410', name: 'Ngân hàng TMCP Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)' },
      { code: '970411', name: 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)' },
      { code: '970412', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)' },
      { code: '970413', name: 'Ngân hàng TMCP Á Châu (ACB)' },
      { code: '970418', name: 'Ngân hàng TMCP Bảo Việt (BaoVietBank)' },
      { code: '970419', name: 'Ngân hàng TMCP Việt Á (VietABank)' },
      { code: '970420', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)' },
      { code: '970421', name: 'Ngân hàng TMCP Đông Á (DongABank)' },
      { code: '970422', name: 'Ngân hàng TMCP Nam Á (NamABank)' },
      { code: '970423', name: 'Ngân hàng TMCP Bắc Á (BacABank)' },
      { code: '970424', name: 'Ngân hàng TMCP Việt Nam Thương Tín (VietBank)' },
      { code: '970425', name: 'Ngân hàng TMCP An Bình (ABBank)' },
      { code: '970426', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970427', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970428', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970429', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970430', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970431', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970432', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970433', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970434', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970435', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970437', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970438', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970439', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970440', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970441', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970442', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970443', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970444', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970445', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970446', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970447', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970448', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970449', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970450', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970451', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970452', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970453', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970454', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970455', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970456', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970457', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970458', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970459', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970460', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970461', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970462', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970463', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970464', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970465', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970466', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970467', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970468', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970469', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970470', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970471', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970472', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970473', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970474', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970475', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970476', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970477', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970478', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970479', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970480', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970481', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970482', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970483', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970484', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970485', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970486', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970487', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970488', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970489', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970490', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970491', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970492', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970493', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970494', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970495', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970496', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970497', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970498', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' },
      { code: '970499', name: 'Ngân hàng TMCP Việt Nam Tín Nghĩa (TienPhongBank)' }
    ];
  }
}

module.exports = ManagerBankAccount;

