-- Tạo bảng lưu trữ thông tin tài khoản ngân hàng của manager theo chuẩn VietQR
CREATE TABLE manager_bank_accounts (
  account_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  bank_code VARCHAR(10) NOT NULL COMMENT 'Mã ngân hàng theo chuẩn VietQR',
  bank_name VARCHAR(100) NOT NULL COMMENT 'Tên ngân hàng',
  account_number VARCHAR(50) NOT NULL COMMENT 'Số tài khoản',
  account_name VARCHAR(100) NOT NULL COMMENT 'Tên chủ tài khoản',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_bank (user_id, bank_code, account_number)
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_manager_bank_user_id ON manager_bank_accounts(user_id);
CREATE INDEX idx_manager_bank_code ON manager_bank_accounts(bank_code);
CREATE INDEX idx_manager_bank_active ON manager_bank_accounts(is_active);

-- Thêm comment cho bảng
ALTER TABLE manager_bank_accounts COMMENT = 'Bảng lưu trữ thông tin tài khoản ngân hàng của manager theo chuẩn VietQR';
