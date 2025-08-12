# Parking Logs API Documentation

## Tổng quan
API này quản lý lịch sử đỗ xe của người dùng, bao gồm thông tin vào/ra bãi, thời gian đỗ xe, phí và thanh toán.

## Endpoints

### 1. Lấy lịch sử đỗ xe của user hiện tại
```
GET /api/parking-logs/history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "log_id": 62,
      "entry_time": "2024-01-17T02:15:00.000Z",
      "exit_time": "2024-01-17T04:45:00.000Z",
      "total_minutes": 150,
      "fee": "25000.00",
      "status": "out",
      "spot_number": "A003",
      "parking_lot_name": "Bãi đỗ xe Trung tâm Thương mại Royal City",
      "parking_lot_address": "72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
      "payment_id": 104,
      "paid_amount": "25000.00",
      "payment_method": "banking",
      "paid_at": "2024-01-17T04:45:00.000Z"
    }
  ]
}
```

### 2. Lấy chi tiết một log đỗ xe
```
GET /api/parking-logs/:logId
Authorization: Bearer <token>
```

### 3. Tạo log đỗ xe mới (khi vào bãi)
```
POST /api/parking-logs/entry
Authorization: Bearer <token>
Content-Type: application/json

{
  "spotId": 22
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tạo log đỗ xe thành công",
  "data": {
    "logId": 70
  }
}
```

### 4. Cập nhật log khi ra bãi
```
PUT /api/parking-logs/:logId/exit
Authorization: Bearer <token>
Content-Type: application/json

{
  "totalMinutes": 120,
  "fee": 20000
}
```

### 5. Lấy tất cả logs (cho admin/manager)
```
GET /api/parking-logs/admin/all
Authorization: Bearer <token>
```

### 6. Lấy logs theo bãi đỗ xe (cho manager)
```
GET /api/parking-logs/admin/parking-lot/:lotId
Authorization: Bearer <token>
```

## Cấu trúc dữ liệu

### ParkingHistory
```typescript
interface ParkingHistory {
  log_id: number;
  entry_time: string;
  exit_time: string | null;
  total_minutes: number | null;
  fee: number | null;
  status: 'in' | 'out' | 'cancelled';
  spot_number: string;
  parking_lot_name: string;
  parking_lot_address: string;
  payment_id: number | null;
  paid_amount: number | null;
  payment_method: string | null;
  paid_at: string | null;
}
```

## Trạng thái đỗ xe
- `in`: Đang đỗ xe
- `out`: Đã ra xe
- `cancelled`: Đã hủy

## Phương thức thanh toán
- `cash`: Tiền mặt
- `momo`: Ví MoMo
- `banking`: Chuyển khoản ngân hàng
- `visa`: Thẻ Visa
- `other`: Khác

## Lưu ý
- Tất cả endpoints đều yêu cầu authentication
- Endpoints admin chỉ dành cho admin và manager
- Thời gian được trả về theo định dạng ISO 8601
- Phí được tính bằng VNĐ

