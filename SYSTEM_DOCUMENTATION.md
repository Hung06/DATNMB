# 🚗 SMART PARKING SYSTEM - SYSTEM DOCUMENTATION

## 📋 TỔNG QUAN HỆ THỐNG

Hệ thống Smart Parking bao gồm 4 thành phần chính:
1. **Backend API** (Node.js/Express + Supabase)
2. **Frontend Mobile App** (React Native/Expo)
3. **License Plate Recognition** (Python + YOLOv5)
4. **ESP32 Hardware Controller** (Arduino C++)

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Python LPR    │    │   Mobile App    │    │   ESP32         │
│   (Camera)      │    │   (React Native)│    │   (Hardware)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ HTTP POST            │ HTTP GET/POST        │ HTTP GET/POST
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Backend API           │
                    │   (Node.js + Express)     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     Supabase Database     │
                    │    (PostgreSQL)           │
                    └───────────────────────────┘
```

---

## 🗄️ CƠ SỞ DỮ LIỆU (SUPABASE)

### **Bảng chính:**
- `users` - Thông tin người dùng và biển số xe
- `parking_lots` - Thông tin bãi đỗ xe
- `parking_spots` - Thông tin từng chỗ đỗ
- `parking_logs` - Lịch sử đỗ xe
- `reservations` - Đặt chỗ trước
- `manager_bank_accounts` - Tài khoản ngân hàng quản lý

### **Thông tin kết nối:**
```env
SUPABASE_URL=https://vfzuiolxvcrfgerxpavo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.vfzuiolxvcrfgerxpavo:Hung2306@02@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## 🔧 BACKEND API (Node.js + Express)

### **Cấu trúc thư mục:**
```
backend/
├── app.js                 # Main application file
├── config/
│   └── database.js        # Database configuration
├── controllers/           # Business logic
│   ├── AuthController.js
│   ├── ParkingLotController.js
│   ├── ParkingSpotController.js
│   ├── ParkingLogController.js
│   ├── ReservationController.js
│   ├── ManagerBankAccountController.js
│   └── LicensePlateController.js  # NEW: LPR integration
├── models/               # Database models
│   ├── UserModel.js
│   ├── ParkingLotModel.js
│   ├── ParkingSpotModel.js
│   ├── ParkingLogModel.js
│   ├── ReservationModel.js
│   └── ManagerBankAccountModel.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── parkingLotRoutes.js
│   ├── parkingSpotRoutes.js
│   ├── parkingLogRoutes.js
│   ├── reservationRoutes.js
│   ├── managerBankAccountRoutes.js
│   ├── sepayWebhookRoutes.js
│   └── licensePlateRoutes.js      # NEW: LPR routes
├── middlewares/
│   └── authMiddleware.js
├── seedData/             # Sample data
└── vercel.json           # Deployment config
```

### **API Endpoints chính:**

#### **1. Authentication APIs**
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh` - Refresh token

#### **2. Parking Lot APIs**
- `GET /api/parking-lots` - Lấy danh sách bãi đỗ
- `GET /api/parking-lots/:id` - Lấy thông tin bãi đỗ
- `POST /api/parking-lots` - Tạo bãi đỗ mới
- `PUT /api/parking-lots/:id` - Cập nhật bãi đỗ
- `DELETE /api/parking-lots/:id` - Xóa bãi đỗ

#### **3. Parking Spot APIs**
- `GET /api/parking-spots` - Lấy danh sách chỗ đỗ
- `GET /api/parking-spots/:id` - Lấy thông tin chỗ đỗ
- `GET /api/parking-spots/lot/:lotId` - Lấy chỗ đỗ theo bãi
- `PUT /api/parking-spots/:id/status` - Cập nhật trạng thái

#### **4. Reservation APIs**
- `POST /api/reservations` - Đặt chỗ
- `GET /api/reservations/user/:userId` - Lịch sử đặt chỗ
- `PUT /api/reservations/:id/cancel` - Hủy đặt chỗ

#### **5. License Plate Recognition APIs** ⭐ **NEW**
- `GET /api/license-plate/system-status` - Trạng thái hệ thống
- `POST /api/license-plate/vehicle-entry` - Xử lý xe vào
- `POST /api/license-plate/vehicle-exit` - Xử lý xe ra
- `POST /api/license-plate/confirm-slot` - Xác nhận slot

### **Environment Variables (.env):**
```env
# Supabase Configuration
SUPABASE_URL=https://vfzuiolxvcrfgerxpavo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres.vfzuiolxvcrfgerxpavo:Hung2306@02@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# Legacy configuration (fallback)
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_USER=postgres.vfzuiolxvcrfgerxpavo
DB_PASSWORD=Hung2306@02
DB_NAME=postgres
DB_PORT=6543
DB_SSL=true

# Server Configuration
PORT=5000
NODE_ENV=production
```

---

## 📱 FRONTEND MOBILE APP (React Native + Expo)

### **Cấu trúc thư mục:**
```
frontend/
├── app/                   # App Router (Expo Router)
│   ├── (tabs)/           # Tab navigation
│   │   ├── index.tsx     # Home screen
│   │   ├── explore.tsx   # Map screen
│   │   ├── history.tsx   # History screen
│   │   └── profile.tsx   # Profile screen
│   ├── auth/             # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── parking-lot/      # Parking lot details
│   │   └── [id].tsx
│   └── reservation/      # Reservation screens
│       ├── payment.tsx
│       ├── payment-simple.tsx
│       └── demo-payment.tsx
├── components/           # Reusable components
│   ├── ui/              # UI components
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   └── ConnectionStatus.tsx
├── services/            # API services
│   ├── apiConfig.ts     # API configuration
│   ├── apiService.ts    # API service methods
│   └── paymentService.ts
├── constants/           # App constants
├── hooks/              # Custom hooks
└── assets/             # Images, fonts
```

### **API Configuration (apiConfig.ts):**
```typescript
export const API_CONFIG = {
  development: {
    baseUrl: 'https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app',
  },
  production: {
    baseUrl: 'https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app',
  },
  test: {
    baseUrl: 'https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app',
  },
};
```

### **Network Security Configuration:**
- **iOS**: `app.json` → `infoPlist` → `NSExceptionDomains`
- **Android**: `android/app/src/main/res/xml/network_security_config.xml`

---

## 🐍 LICENSE PLATE RECOGNITION (Python)

### **Cấu trúc thư mục:**
```
License-Plate-Recognition/
├── app.py               # Main LPR application
├── webcam.py           # Webcam interface
├── lp_image.py         # Image processing
├── config.json         # Configuration
├── yolov5/             # YOLOv5 models
├── model/              # Trained models
│   ├── LP_detector.pt
│   ├── LP_ocr.pt
│   ├── LP_detector_nano_61.pt
│   └── LP_ocr_nano_62.pt
├── function/           # Helper functions
├── templates/          # Web templates
└── result/             # Output images
```

### **Backend URL Configuration:**
```python
BACKEND_URL = 'https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app'
```

### **API Integration:**
- Gửi biển số nhận diện được đến backend
- Nhận phản hồi từ backend về việc mở cổng
- Xử lý lỗi và retry logic

---

## 🔌 ESP32 HARDWARE CONTROLLER

### **File chính:**
```
License-Plate-Recognition/esp32_supabase_parking_v2/
└── esp32_supabase_parking_v2_fixed.ino
```

### **Pin Mapping:**
```
Slot 1: Trig=GPIO4,  Echo=GPIO5,  LED_G=GPIO16, LED_R=GPIO17
Slot 2: Trig=GPIO18, Echo=GPIO19, LED_G=GPIO22, LED_R=GPIO23
Slot 3: Trig=GPIO26, Echo=GPIO27, LED_G=GPIO32, LED_R=GPIO14
Slot 4: Trig=GPIO12, Echo=GPIO13, LED_G=GPIO25, LED_R=GPIO33
Servo: GPIO21
```

### **Backend URL Configuration:**
```cpp
const char* BACKEND_URL = "https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app";
```

### **Chức năng:**
- Điều khiển servo mở/đóng cổng
- Đọc cảm biến HC-SR04 (5-8cm = có xe)
- Điều khiển LED xanh/đỏ
- Gọi API backend để cập nhật trạng thái

---

## 🚀 DEPLOYMENT & UPDATES

### **Backend Deployment (Vercel):**

#### **1. Cập nhật Backend:**
```bash
cd backend
# Sửa code
git add .
git commit -m "Update backend"
git push
# Vercel tự động deploy
```

#### **2. Cập nhật URL mới:**
Khi Vercel tạo URL mới, cần cập nhật ở **4 nơi**:

1. **Python LPR** (`License-Plate-Recognition/app.py`):
```python
BACKEND_URL = 'https://NEW-VERCEL-URL.vercel.app'
```

2. **ESP32** (`esp32_supabase_parking_v2_fixed.ino`):
```cpp
const char* BACKEND_URL = "https://NEW-VERCEL-URL.vercel.app";
```

3. **Frontend** (`frontend/services/apiConfig.ts`):
```typescript
export const API_CONFIG = {
  development: { baseUrl: 'https://NEW-VERCEL-URL.vercel.app' },
  production: { baseUrl: 'https://NEW-VERCEL-URL.vercel.app' },
  test: { baseUrl: 'https://NEW-VERCEL-URL.vercel.app' },
};
```

4. **Network Security** (`frontend/app.json` & `network_security_config.xml`):
```json
// app.json
"NSExceptionDomains": {
  "NEW-VERCEL-URL.vercel.app": {
    "NSExceptionAllowsInsecureHTTPLoads": true,
    "NSExceptionMinimumTLSVersion": "1.0"
  }
}
```

### **Frontend Deployment:**
```bash
cd frontend
npm start  # Development
# Hoặc build cho production
```

---

## 🔄 QUY TRÌNH CẬP NHẬT HỆ THỐNG

### **Khi sửa Backend API:**

1. **Sửa code backend** trong thư mục `backend/`
2. **Test local** (nếu cần):
   ```bash
   cd backend
   npm start
   ```
3. **Deploy lên Vercel**:
   ```bash
   git add .
   git commit -m "Update API"
   git push
   ```
4. **Kiểm tra deployment** trên Vercel dashboard
5. **Test API mới** bằng Postman hoặc curl
6. **Cập nhật frontend** nếu cần (thường không cần nếu chỉ sửa logic)

### **Khi thêm API endpoint mới:**

1. **Tạo route** trong `backend/routes/`
2. **Tạo controller** trong `backend/controllers/`
3. **Tạo model** trong `backend/models/` (nếu cần)
4. **Thêm route vào app.js**
5. **Deploy backend**
6. **Cập nhật frontend** `apiService.ts` nếu cần

### **Khi sửa Database Schema:**

1. **Sửa trực tiếp trên Supabase Dashboard**
2. **Cập nhật models** trong `backend/models/`
3. **Test API** để đảm bảo tương thích
4. **Deploy backend**

---

## 🧪 TESTING & DEBUGGING

### **Test Backend APIs:**
```bash
# Test system status
curl https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app/api/license-plate/system-status

# Test vehicle entry
curl -X POST https://backend-q2o5ejuk5-hungs-projects-420012d8.vercel.app/api/license-plate/vehicle-entry \
  -H "Content-Type: application/json" \
  -d '{"license_plate": "51A-12345"}'
```

### **Test Frontend:**
```bash
cd frontend
npm start
# Mở Expo Go app trên điện thoại
```

### **Debug ESP32:**
- Mở Serial Monitor trong Arduino IDE
- Kiểm tra WiFi connection
- Kiểm tra API calls

---

## 📞 LIÊN HỆ & HỖ TRỢ

### **Thông tin quan trọng:**
- **Database**: Supabase (PostgreSQL)
- **Backend**: Vercel (Node.js)
- **Frontend**: Expo (React Native)
- **LPR**: Python + YOLOv5
- **Hardware**: ESP32 + HC-SR04 + Servo

### **Khi gặp lỗi:**
1. Kiểm tra logs trong Vercel dashboard
2. Kiểm tra Supabase logs
3. Test API endpoints
4. Kiểm tra network connectivity
5. Kiểm tra environment variables

---

## 📝 GHI CHÚ QUAN TRỌNG

### **⚠️ Lưu ý khi cập nhật:**
- **LUÔN** cập nhật URL backend ở cả 4 nơi khi deploy mới
- **KIỂM TRA** environment variables trước khi deploy
- **TEST** API endpoints sau khi deploy
- **BACKUP** database trước khi thay đổi schema

### **🔒 Bảo mật:**
- Không commit API keys vào git
- Sử dụng environment variables
- Kiểm tra CORS settings
- Validate input data

### **📊 Monitoring:**
- Theo dõi Vercel logs
- Kiểm tra Supabase usage
- Monitor API response times
- Track error rates

---

**📅 Cập nhật lần cuối:** 10/09/2025  
**👨‍💻 Tác giả:** AI Assistant  
**🔄 Phiên bản:** 1.0
