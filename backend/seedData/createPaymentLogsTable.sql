-- Tạo bảng payment_logs để lưu trữ thông tin thanh toán
CREATE TABLE IF NOT EXISTS payment_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'sepay',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  bank_code VARCHAR(50),
  account_number VARCHAR(50),
  transaction_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_reservation_id (reservation_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Thêm cột payment_id vào bảng reservations nếu chưa có
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NULL DEFAULT 'sepay',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS payment_time DATETIME NULL;

-- Tạo index cho payment_id
CREATE INDEX IF NOT EXISTS idx_reservations_payment_id ON reservations(payment_id);
