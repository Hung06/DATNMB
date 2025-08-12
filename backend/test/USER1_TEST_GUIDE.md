# Hướng dẫn Test User1@gmail.com - Bãi Phenikaa

## Thông tin tài khoản
- **Email:** user1@gmail.com
- **Mật khẩu:** 123456
- **Tên:** Nguyễn Văn A
- **Biển số xe:** 30A-12345
- **Số điện thoại:** 0123456789

## Dữ liệu đã được tạo

### 🏢 Bãi đỗ xe Phenikaa
- **Tên:** Bãi đỗ xe Trường Đại học Phenikaa
- **Địa chỉ:** Yên Nghĩa, Hà Đông, Hà Nội
- **Giá:** 8,000 VNĐ/giờ
- **4 chỗ đỗ xe:** P001, P002, P003, P004

### 📊 Lịch sử đỗ xe (5 lần)
- **4 lần đã hoàn thành** với phí tính theo thời gian thực tế
- **1 lần đang đỗ xe** (chưa ra xe)

### 💳 Thanh toán (4 thanh toán)
- Tiền mặt (cash)
- Ví MoMo (momo)
- Chuyển khoản ngân hàng (banking)
- Thẻ Visa (visa)

### 📅 Đặt chỗ (2 đặt chỗ)
- 1 đặt chỗ đã xác nhận
- 1 đặt chỗ đang chờ xác nhận

## Cách tính phí theo thời gian
- **2 giờ đỗ xe** = 2 giờ × 8,000 VNĐ = **16,000 VNĐ**
- **2.5 giờ đỗ xe** = 3 giờ × 8,000 VNĐ = **24,000 VNĐ** (làm tròn lên)

## Cách test

### 1. Khởi động server
```bash
cd backend
npm start
```

### 2. Test API bằng script
```bash
node testUser1API.js
```

### 3. Test trên frontend
1. Mở app React Native
2. Đăng nhập với:
   - Email: user1@gmail.com
   - Password: 123456
3. Kiểm tra các chức năng:
   - Trang chủ: Xem danh sách bãi đỗ xe
   - Trang History: Xem lịch sử đỗ xe
   - Trang Đặt chỗ: Xem và quản lý đặt chỗ
   - Trang Profile: Xem thông tin cá nhân

## API Endpoints có thể test

### Authentication
```
POST /api/auth/login
{
  "email": "user1@gmail.com",
  "password": "123456"
}
```

### Parking Lots
```
GET /api/parking-lots          - Danh sách bãi đỗ xe
GET /api/parking-lots/:id      - Chi tiết bãi đỗ xe
```

### Parking Logs
```
GET /api/parking-logs/history  - Lịch sử đỗ xe của user
POST /api/parking-logs/entry   - Tạo log đỗ xe mới
PUT /api/parking-logs/:id/exit - Cập nhật log ra bãi
```

### Reservations
```
GET /api/reservations                    - Danh sách đặt chỗ của user
GET /api/reservations/:id                - Chi tiết đặt chỗ
POST /api/reservations                   - Tạo đặt chỗ mới
PUT /api/reservations/:id/cancel         - Hủy đặt chỗ
GET /api/admin/reservations              - Tất cả đặt chỗ (Admin/Manager)
PUT /api/admin/reservations/:id/status   - Cập nhật trạng thái (Admin/Manager)
```

### Parking Spots
```
GET /api/parking-spots         - Danh sách chỗ đỗ xe
GET /api/parking-spots/:id     - Chi tiết chỗ đỗ xe
```

## Dữ liệu mẫu chi tiết

### Lịch sử đỗ xe
1. **15/01/2024** - Chỗ P001 - 2 giờ - 16,000 VNĐ - Đã thanh toán
2. **16/01/2024** - Chỗ P002 - 2.5 giờ - 24,000 VNĐ - Đã thanh toán
3. **17/01/2024** - Chỗ P003 - 2.5 giờ - 24,000 VNĐ - Đã thanh toán
4. **18/01/2024** - Chỗ P004 - 2 giờ - 16,000 VNĐ - Đã thanh toán
5. **25/01/2024** - Chỗ P001 - Đang đỗ xe - Chưa thanh toán

### Đặt chỗ
1. **26/01/2024** - Chỗ P002 - 09:00-12:00 - Đã xác nhận
2. **27/01/2024** - Chỗ P003 - 11:00-14:00 - Chờ xác nhận

## Chi tiết tính phí
- **Giá gốc:** 8,000 VNĐ/giờ
- **Quy tắc tính:** Làm tròn lên theo giờ
- **Ví dụ:**
  - 1 giờ 30 phút = 2 giờ = 16,000 VNĐ
  - 2 giờ 15 phút = 3 giờ = 24,000 VNĐ
  - 3 giờ 45 phút = 4 giờ = 32,000 VNĐ

## Lưu ý
- Tất cả API đều yêu cầu authentication token
- Dữ liệu được tạo với user_id = 14
- Chỉ sử dụng bãi Phenikaa với 4 chỗ đỗ xe
- Phí được tính chính xác theo thời gian thực tế
- Frontend sẽ tự động gọi API khi đăng nhập thành công
