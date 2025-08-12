const ManagerBankAccount = require('../models/ManagerBankAccountModel');

class ManagerBankAccountController {
  // Lấy danh sách tài khoản ngân hàng của manager hiện tại
  static async getMyBankAccounts(req, res) {
    try {
      const userId = req.user.user_id;
      
      // Kiểm tra role
      if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ manager mới có quyền truy cập thông tin tài khoản ngân hàng'
        });
      }

      const bankAccounts = await ManagerBankAccount.getByUserId(userId);
      
      res.json({
        success: true,
        data: bankAccounts
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách tài khoản ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách tài khoản ngân hàng'
      });
    }
  }

  // Lấy chi tiết một tài khoản ngân hàng
  static async getBankAccountDetail(req, res) {
    try {
      const { accountId } = req.params;
      const userId = req.user.user_id;

      const bankAccount = await ManagerBankAccount.getById(accountId);
      
      if (!bankAccount) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản ngân hàng'
        });
      }

      // Kiểm tra quyền truy cập
      if (req.user.role !== 'admin' && bankAccount.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập tài khoản ngân hàng này'
        });
      }

      res.json({
        success: true,
        data: bankAccount
      });
    } catch (error) {
      console.error('Lỗi lấy chi tiết tài khoản ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy chi tiết tài khoản ngân hàng'
      });
    }
  }

  // Tạo tài khoản ngân hàng mới
  static async createBankAccount(req, res) {
    try {
      const userId = req.user.user_id;
      
      // Kiểm tra role
      if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ manager mới có quyền tạo tài khoản ngân hàng'
        });
      }

      const { bank_code, bank_name, account_number, account_name } = req.body;

      // Validation
      if (!bank_code || !bank_name || !account_number || !account_name) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng'
        });
      }

      // Kiểm tra mã ngân hàng có hợp lệ không
      const validBankCodes = ManagerBankAccount.getVietQRBankCodes();
      const isValidBankCode = validBankCodes.some(bank => bank.code === bank_code);
      
      if (!isValidBankCode) {
        return res.status(400).json({
          success: false,
          message: 'Mã ngân hàng không hợp lệ'
        });
      }

      // Kiểm tra tài khoản đã tồn tại chưa
      const exists = await ManagerBankAccount.checkExists(userId, bank_code, account_number);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Tài khoản ngân hàng này đã tồn tại'
        });
      }

      const bankAccountData = {
        user_id: userId,
        bank_code,
        bank_name,
        account_number,
        account_name,
        is_active: true
      };

      const accountId = await ManagerBankAccount.create(bankAccountData);
      
      const newBankAccount = await ManagerBankAccount.getById(accountId);

      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản ngân hàng thành công',
        data: newBankAccount
      });
    } catch (error) {
      console.error('Lỗi tạo tài khoản ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo tài khoản ngân hàng'
      });
    }
  }

  // Cập nhật tài khoản ngân hàng
  static async updateBankAccount(req, res) {
    try {
      const { accountId } = req.params;
      const userId = req.user.user_id;
      const { bank_code, bank_name, account_number, account_name, is_active } = req.body;

      // Kiểm tra tài khoản tồn tại
      const existingAccount = await ManagerBankAccount.getById(accountId);
      if (!existingAccount) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản ngân hàng'
        });
      }

      // Kiểm tra quyền truy cập
      if (req.user.role !== 'admin' && existingAccount.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền cập nhật tài khoản ngân hàng này'
        });
      }

      // Validation
      if (!bank_code || !bank_name || !account_number || !account_name) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng'
        });
      }

      // Kiểm tra mã ngân hàng có hợp lệ không
      const validBankCodes = ManagerBankAccount.getVietQRBankCodes();
      const isValidBankCode = validBankCodes.some(bank => bank.code === bank_code);
      
      if (!isValidBankCode) {
        return res.status(400).json({
          success: false,
          message: 'Mã ngân hàng không hợp lệ'
        });
      }

      // Kiểm tra tài khoản đã tồn tại chưa (trừ tài khoản hiện tại)
      const exists = await ManagerBankAccount.checkExists(userId, bank_code, account_number, accountId);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Tài khoản ngân hàng này đã tồn tại'
        });
      }

      const updateData = {
        bank_code,
        bank_name,
        account_number,
        account_name,
        is_active: is_active !== undefined ? is_active : existingAccount.is_active
      };

      const updated = await ManagerBankAccount.update(accountId, updateData);
      
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Cập nhật tài khoản ngân hàng thất bại'
        });
      }

      const updatedAccount = await ManagerBankAccount.getById(accountId);

      res.json({
        success: true,
        message: 'Cập nhật tài khoản ngân hàng thành công',
        data: updatedAccount
      });
    } catch (error) {
      console.error('Lỗi cập nhật tài khoản ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật tài khoản ngân hàng'
      });
    }
  }

  // Xóa tài khoản ngân hàng
  static async deleteBankAccount(req, res) {
    try {
      const { accountId } = req.params;
      const userId = req.user.user_id;

      // Kiểm tra tài khoản tồn tại
      const existingAccount = await ManagerBankAccount.getById(accountId);
      if (!existingAccount) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản ngân hàng'
        });
      }

      // Kiểm tra quyền truy cập
      if (req.user.role !== 'admin' && existingAccount.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xóa tài khoản ngân hàng này'
        });
      }

      const deleted = await ManagerBankAccount.delete(accountId);
      
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Xóa tài khoản ngân hàng thất bại'
        });
      }

      res.json({
        success: true,
        message: 'Xóa tài khoản ngân hàng thành công'
      });
    } catch (error) {
      console.error('Lỗi xóa tài khoản ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa tài khoản ngân hàng'
      });
    }
  }

  // Lấy tất cả tài khoản ngân hàng (cho admin)
  static async getAllBankAccounts(req, res) {
    try {
      // Kiểm tra role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ admin mới có quyền xem tất cả tài khoản ngân hàng'
        });
      }

      const bankAccounts = await ManagerBankAccount.getAll();
      
      res.json({
        success: true,
        data: bankAccounts
      });
    } catch (error) {
      console.error('Lỗi lấy tất cả tài khoản ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy tất cả tài khoản ngân hàng'
      });
    }
  }

  // Lấy danh sách mã ngân hàng VietQR
  static async getVietQRBankCodes(req, res) {
    try {
      const bankCodes = ManagerBankAccount.getVietQRBankCodes();
      
      res.json({
        success: true,
        data: bankCodes
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách mã ngân hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách mã ngân hàng'
      });
    }
  }
}

module.exports = ManagerBankAccountController;

