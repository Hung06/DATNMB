const express = require('express');
const router = express.Router();
const ManagerBankAccountController = require('../controllers/ManagerBankAccountController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả routes đều yêu cầu authentication
router.use(authMiddleware);

// Routes cho manager
router.get('/manager/bank-accounts', ManagerBankAccountController.getMyBankAccounts);
router.get('/manager/bank-accounts/:accountId', ManagerBankAccountController.getBankAccountDetail);
router.post('/manager/bank-accounts', ManagerBankAccountController.createBankAccount);
router.put('/manager/bank-accounts/:accountId', ManagerBankAccountController.updateBankAccount);
router.delete('/manager/bank-accounts/:accountId', ManagerBankAccountController.deleteBankAccount);

// Routes cho admin
router.get('/admin/bank-accounts', ManagerBankAccountController.getAllBankAccounts);

// Routes chung (có thể truy cập bởi tất cả user đã đăng nhập)
router.get('/bank-codes', ManagerBankAccountController.getVietQRBankCodes);

module.exports = router;

