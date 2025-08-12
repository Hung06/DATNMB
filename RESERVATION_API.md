# Reservation API Documentation

## Tổng quan
API này quản lý việc đặt chỗ đỗ xe của người dùng, bao gồm tạo đặt chỗ, xem danh sách, cập nhật trạng thái và hủy đặt chỗ.

## Endpoints

### 1. Lấy danh sách đặt chỗ của user hiện tại
```
GET /api/reservations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "reservation_id": 1,
      "reserved_at": "2024-01-26T08:00:00.000Z",
      "expected_start": "2024-01-26T09:00:00.000Z",
      "expected_end": "2024-01-26T12:00:00.000Z",
      "status": "confirmed",
      "spot_number": "P002",
      "spot_type": "standard",
      "parking_lot_name": "Bãi đỗ xe Trường Đại học Phenikaa",
      "parking_lot_address": "Yên Nghĩa, Hà Đông, Hà Nội",
      "price_per_hour": "8000.00"
    }
  ],
  "count": 1
}
```

### 2. Lấy chi tiết một đặt chỗ
```
GET /api/reservations/:reservationId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reservation_id": 1,
    "user_id": 14,
    "spot_id": 2,
    "reserved_at": "2024-01-26T08:00:00.000Z",
    "expected_start": "2024-01-26T09:00:00.000Z",
    "expected_end": "2024-01-26T12:00:00.000Z",
    "status": "confirmed",
    "spot_number": "P002",
    "spot_type": "standard",
    "parking_lot_name": "Bãi đỗ xe Trường Đại học Phenikaa",
    "parking_lot_address": "Yên Nghĩa, Hà Đông, Hà Nội",
    "price_per_hour": "8000.00",
    "user_name": "Nguyễn Văn A",
    "user_email": "user1@gmail.com",
    "license_plate": "30A-12345"
  }
}
```

### 3. Tạo đặt chỗ mới
```
POST /api/reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "spotId": 2,
  "expectedStart": "2024-01-26 09:00:00",
  "expectedEnd": "2024-01-26 12:00:00",
  "depositAmount": 10000,
  "paymentMethod": "momo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt chỗ thành công",
  "data": {
    "reservationId": 1,
    "depositAmount": 10000,
    "paymentMethod": "momo"
  }
}
```

### 4. Hủy đặt chỗ
```
PUT /api/reservations/:reservationId/cancel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Hủy đặt chỗ thành công"
}
```

### 5. Cập nhật trạng thái đặt chỗ (cho admin/manager)
```
PUT /api/admin/reservations/:reservationId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thành công"
}
```

### 6. Lấy tất cả đặt chỗ (cho admin/manager)
```
GET /api/admin/reservations
Authorization: Bearer <token>
```

### 7. Lấy đặt chỗ theo bãi đỗ xe (cho manager)
```
GET /api/admin/reservations/parking-lot/:lotId
Authorization: Bearer <token>
```

### 8. Xóa đặt chỗ (cho admin)
```
DELETE /api/admin/reservations/:reservationId
Authorization: Bearer <token>
```

## Cấu trúc dữ liệu

### Reservation
```typescript
interface Reservation {
  reservation_id: number;
  user_id: number;
  spot_id: number;
  reserved_at: string;
  expected_start: string;
  expected_end: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  spot_number: string;
  spot_type: 'standard' | 'vip' | 'ev';
  parking_lot_name: string;
  parking_lot_address: string;
  price_per_hour: number;
  user_name?: string;
  user_email?: string;
  license_plate?: string;
}
```

## Trạng thái đặt chỗ

- **pending**: Chờ xác nhận
- **confirmed**: Đã xác nhận
- **cancelled**: Đã hủy

## Quyền truy cập

### User (role: 'user')
- Xem danh sách đặt chỗ của mình
- Xem chi tiết đặt chỗ của mình
- Tạo đặt chỗ mới
- Hủy đặt chỗ của mình

### Manager (role: 'manager')
- Tất cả quyền của user
- Xem tất cả đặt chỗ
- Xem đặt chỗ theo bãi đỗ xe
- Cập nhật trạng thái đặt chỗ

### Admin (role: 'admin')
- Tất cả quyền của manager
- Xóa đặt chỗ

## Validation

### Tạo đặt chỗ
- `spotId`: Bắt buộc, phải là số nguyên
- `expectedStart`: Bắt buộc, định dạng datetime
- `expectedEnd`: Bắt buộc, định dạng datetime, phải sau expectedStart
- Kiểm tra chỗ đỗ xe có khả dụng không
- Kiểm tra xung đột lịch đặt chỗ

### Cập nhật trạng thái
- `status`: Phải là một trong ['pending', 'confirmed', 'cancelled']

## Lỗi thường gặp

### 400 Bad Request
```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc: spotId, expectedStart, expectedEnd"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Không có quyền truy cập đặt chỗ này"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy đặt chỗ"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Chỗ đỗ xe đã được đặt trong khoảng thời gian này"
}
```

## Ví dụ sử dụng

### Tạo đặt chỗ
```javascript
const response = await fetch('http://localhost:5000/api/reservations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    spotId: 2,
    expectedStart: '2024-01-26 09:00:00',
    expectedEnd: '2024-01-26 12:00:00',
    depositAmount: 10000,
    paymentMethod: 'momo'
  }),
});
```

### Lấy danh sách đặt chỗ
```javascript
const response = await fetch('http://localhost:5000/api/reservations', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const data = await response.json();
console.log(data.data); // Danh sách đặt chỗ
```

### Hủy đặt chỗ
```javascript
const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}/cancel`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Lưu ý

1. Tất cả API đều yêu cầu authentication token
2. Thời gian được lưu dưới định dạng MySQL DATETIME
3. Khi tạo đặt chỗ, hệ thống sẽ tự động cập nhật trạng thái chỗ đỗ xe
4. Khi hủy đặt chỗ, hệ thống sẽ tự động giải phóng chỗ đỗ xe
5. Hệ thống kiểm tra xung đột lịch đặt chỗ trước khi cho phép tạo đặt chỗ mới

