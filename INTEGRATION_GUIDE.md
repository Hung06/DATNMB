# Hướng dẫn tích hợp hệ thống License Plate Recognition với Backend

## Tổng quan hệ thống

Hệ thống đã được tích hợp hoàn chỉnh với luồng xử lý mới:

```
Camera → Python (nhận diện biển số) → Backend API → ESP32 (mở cổng) → HC-SR04 (xác định slot) → Database
```

## Cấu hình Pin ESP32

### LED cho các slot:
- **Slot 1**: LED Xanh GPIO16, LED Đỏ GPIO17
- **Slot 2**: LED Xanh GPIO22, LED Đỏ GPIO23  
- **Slot 3**: LED Xanh GPIO32, LED Đỏ GPIO14
- **Slot 4**: LED Xanh GPIO25, LED Đỏ GPIO33

### HC-SR04 Sensors:
- **Slot 1**: Trig GPIO4, Echo GPIO5
- **Slot 2**: Trig GPIO18, Echo GPIO19
- **Slot 3**: Trig GPIO26, Echo GPIO27
- **Slot 4**: Trig GPIO12, Echo GPIO13

### Servo và LED khác:
- **Servo**: GPIO21
- **Payment LED**: GPIO15

## Các thành phần đã được cập nhật

### 1. Backend API (Node.js)
- **File mới**: `backend/controllers/LicensePlateController.js`
- **Routes mới**: `backend/routes/licensePlateRoutes.js`
- **API endpoints**:
  - `POST /api/license-plate/vehicle-entry` - Xử lý xe vào bãi
  - `POST /api/license-plate/vehicle-exit` - Xử lý xe ra bãi
  - `POST /api/license-plate/confirm-slot` - Xác nhận xe vào slot
  - `GET /api/license-plate/system-status` - Trạng thái hệ thống

### 2. Python License Plate Recognition
- **File cập nhật**: `License-Plate-Recognition/app.py`
- **Thay đổi chính**:
  - Gửi biển số lên backend thay vì trực tiếp đến ESP32
  - Thêm function `send_license_plate_to_backend()`
  - Hỗ trợ cả xe vào và xe ra bãi

### 3. ESP32 Code
- **File cập nhật**: `License-Plate-Recognition/esp32_supabase_parking_v2/esp32_supabase_parking_v2_fixed.ino`
- **Thay đổi chính**:
  - Thêm HC-SR04 sensors để xác định slot
  - Cập nhật pin mapping theo bảng mới
  - Thêm endpoint `/backend_signal` để nhận tín hiệu từ backend
  - Tự động gửi xác nhận slot về backend

## Luồng hoạt động

### Xe vào bãi:
1. Camera nhận diện biển số
2. Python gửi biển số lên backend API
3. Backend kiểm tra biển số trong database
4. Nếu hợp lệ:
   - Tìm chỗ đỗ xe trống
   - Tạo parking log
   - Gửi tín hiệu mở cổng cho ESP32
   - ESP32 mở cổng và bật LED
5. HC-SR04 xác định xe vào slot nào
6. ESP32 gửi xác nhận về backend
7. Backend cập nhật trạng thái slot

### Xe ra bãi:
1. Camera nhận diện biển số
2. Python gửi biển số lên backend API
3. Backend tìm parking log đang hoạt động
4. Tính phí đỗ xe
5. Gửi tín hiệu mở cổng cho ESP32
6. ESP32 mở cổng
7. Backend cập nhật parking log và giải phóng slot

## Cài đặt và chạy

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Python License Plate Recognition
```bash
cd License-Plate-Recognition
pip install -r requirement.txt
python app.py
```

### 3. ESP32
- Upload code lên ESP32
- Kết nối các thiết bị theo pin mapping
- Cấu hình WiFi trong code

## Cấu hình

### Backend (.env)
```
ESP32_IP=192.168.0.108
ESP32_PORT=80
```

### Python (config.json)
```json
{
  "esp32_config": {
    "ip_address": "192.168.0.108",
    "port": 80
  },
  "camera_config": {
    "cooldown_seconds": 5,
    "confidence_threshold": 0.60
  }
}
```

### ESP32
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL = "http://YOUR_BACKEND_IP:3000";
```

## API Documentation

### Vehicle Entry
```http
POST /api/license-plate/vehicle-entry
Content-Type: application/json

{
  "license_plate": "30A12345"
}
```

### Vehicle Exit
```http
POST /api/license-plate/vehicle-exit
Content-Type: application/json

{
  "license_plate": "30A12345"
}
```

### Confirm Slot
```http
POST /api/license-plate/confirm-slot
Content-Type: application/json

{
  "log_id": 123,
  "spot_id": 1,
  "distance": 6.5
}
```

## Troubleshooting

### 1. ESP32 không kết nối được backend
- Kiểm tra IP address của backend
- Kiểm tra firewall
- Kiểm tra WiFi connection

### 2. HC-SR04 không hoạt động
- Kiểm tra kết nối pin
- Kiểm tra nguồn điện
- Kiểm tra khoảng cách (5-8cm)

### 3. Python không gửi được request
- Kiểm tra backend có chạy không
- Kiểm tra URL trong config
- Kiểm tra network connection

## Tính năng mới

1. **Tự động xác định slot**: HC-SR04 sensors tự động phát hiện xe vào slot nào
2. **Tính phí chính xác**: Tính phí dựa trên thời gian thực tế đỗ xe
3. **Quản lý slot thông minh**: Tự động cập nhật trạng thái slot
4. **API tích hợp**: Backend API hoàn chỉnh cho việc quản lý
5. **Xử lý lỗi**: Xử lý lỗi và retry mechanism

## Lưu ý quan trọng

1. **Pin mapping**: Đảm bảo kết nối đúng pin theo bảng
2. **Khoảng cách HC-SR04**: Điều chỉnh MIN_DISTANCE và MAX_DISTANCE phù hợp
3. **Network**: Đảm bảo tất cả thiết bị trong cùng mạng
4. **Database**: Đảm bảo database có đủ dữ liệu users và parking_spots
