# Hướng dẫn tích hợp SePay

## Tổng quan
Ứng dụng đã được tích hợp SePay để xử lý thanh toán QR động. SePay sẽ gửi webhook khi có thanh toán thành công.

## Cấu hình SePay

### 1. Thông tin tài khoản SePay
- **Tài khoản**: VQRQADSHI0914
- **Ngân hàng**: MBBank
- **URL QR động**: `https://qr.sepay.vn/img?acc=VQRQADSHI0914&bank=MBBank&amount=SO_TIEN&des=MA_GIAO_DICH`

### 2. Format mã giao dịch (des parameter)
```
USER_{userId}_SPOT_{spotId}_LOT_{lotId}
```

Ví dụ: `USER_123_SPOT_1_LOT_1`

## Setup Database

### 1. Chạy migration để tạo bảng payment
```bash
cd backend/seedData
node setupPaymentTables.js
```

### 2. Cấu trúc bảng mới
- **payment_logs**: Lưu trữ thông tin thanh toán từ SePay
- **reservations**: Thêm các cột payment_id, payment_method, payment_amount, payment_time

## API Endpoints

### 1. Webhook SePay
```
POST /api/sepay/webhook
```
Nhận thông báo thanh toán từ SePay và cập nhật trạng thái đặt chỗ.

### 2. Kiểm tra trạng thái thanh toán
```
GET /api/sepay/check-payment/:transactionId
```
Kiểm tra trạng thái thanh toán theo transaction ID.

## Cấu hình Webhook

### 1. URL Webhook
```
https://your-domain.com/api/sepay/webhook
```

### 2. Cấu hình trong SePay Dashboard
- Đăng nhập vào SePay Dashboard
- Vào phần cấu hình webhook
- Thêm URL webhook ở trên
- Cấu hình secret key (đặt trong .env)

### 3. Environment Variables
```env
SEPAY_SECRET_KEY=your-secret-key-here
```

## Luồng thanh toán

### 1. Tạo QR Code
- Frontend tạo URL SePay với thông tin thanh toán
- Hiển thị QR code cho người dùng quét

### 2. Thanh toán
- Người dùng quét QR và thanh toán
- SePay xử lý thanh toán

### 3. Webhook
- SePay gửi webhook đến backend
- Backend xác thực và cập nhật trạng thái

### 4. Polling (Tùy chọn)
- Frontend có thể poll để kiểm tra trạng thái
- Hiển thị thông báo thành công/thất bại

## Testing

### 1. Test Webhook
```bash
# Sử dụng ngrok để test webhook locally
ngrok http 5000

# Cập nhật webhook URL trong SePay dashboard
```

### 2. Test QR Code
- Tạo QR code với số tiền nhỏ
- Quét và thanh toán test
- Kiểm tra webhook được gọi

## Troubleshooting

### 1. Webhook không nhận được
- Kiểm tra URL webhook có đúng không
- Kiểm tra firewall/network
- Kiểm tra logs của server

### 2. Signature verification failed
- Kiểm tra SEPAY_SECRET_KEY có đúng không
- Kiểm tra format của webhook payload

### 3. QR Code không hiển thị
- Kiểm tra URL SePay có đúng format không
- Kiểm tra thông tin tài khoản SePay

## Security

### 1. Webhook Verification
- Luôn verify signature từ SePay
- Không trust webhook data mà không verify

### 2. Rate Limiting
- Implement rate limiting cho webhook endpoint
- Log tất cả webhook requests

### 3. Error Handling
- Handle gracefully khi webhook fail
- Retry mechanism cho failed payments

## Monitoring

### 1. Logs
- Log tất cả webhook requests
- Log payment status changes
- Monitor failed payments

### 2. Alerts
- Alert khi webhook fail
- Alert khi có payment issues
- Monitor payment success rate
