-- Thêm cột payment_status và payment_time vào bảng parking_logs
ALTER TABLE parking_logs 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_time TIMESTAMP WITH TIME ZONE;

-- Cập nhật dữ liệu cũ: những lịch sử đã ra xe thì đánh dấu đã thanh toán
UPDATE parking_logs 
SET 
  payment_status = 'paid',
  payment_time = exit_time
WHERE status = 'out' AND (payment_status IS NULL OR payment_status = 'pending');

-- Hiển thị kết quả
SELECT 
  log_id,
  user_id,
  status,
  payment_status,
  payment_time,
  exit_time
FROM parking_logs 
WHERE status = 'out'
ORDER BY exit_time DESC
LIMIT 10;
