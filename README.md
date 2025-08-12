# 🚗 DATNMB - Ứng dụng đỗ xe thông minh

Ứng dụng di động giúp người dùng tìm kiếm, đặt chỗ và thanh toán cho bãi đỗ xe một cách thông minh và tiện lợi.

## ✨ Tính năng chính

- 🔍 **Tìm kiếm bãi đỗ xe** theo vị trí hiện tại
- 📍 **Chỉ đường** đến bãi đỗ xe được chọn
- 🎯 **Đặt chỗ** cho từng vị trí cụ thể
- 💳 **Thanh toán** tiền cọc qua QR code
- 👤 **Quản lý profile** người dùng
- 🔐 **Đăng nhập/Đăng ký** với Google hoặc email
- 📱 **Giao diện thân thiện** trên React Native

## 🛠️ Công nghệ sử dụng

### Frontend
- **React Native** với Expo
- **TypeScript** cho type safety
- **Expo Router** cho navigation
- **Google Sign-In** cho authentication
- **AsyncStorage** cho local storage

### Backend
- **Node.js** với Express
- **MySQL** database
- **JWT** authentication
- **Google OAuth** integration
- **bcrypt** cho password hashing

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+
- npm hoặc yarn
- Expo CLI
- MySQL database

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## 📱 Cấu trúc project

```
DATNMB/
├── backend/                 # Backend Node.js/Express
│   ├── controllers/        # Business logic
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Authentication & validation
│   └── config/            # Database & environment config
├── frontend/               # React Native app
│   ├── app/               # App screens & navigation
│   ├── assets/            # Images, fonts, etc.
│   └── components/        # Reusable components
└── README.md
```

## 🔧 Cấu hình

### Backend Environment Variables
Tạo file `.env` trong thư mục `backend`:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend Configuration
Cập nhật `BASE_URL` trong các file API calls:
```typescript
const BASE_URL = 'http://your_backend_ip:5000';
```

## 📊 Database Schema

### Users
- `user_id` (Primary Key)
- `full_name`
- `email`
- `phone`
- `license_plate`
- `role`
- `created_at`

### Parking Lots
- `parking_lot_id` (Primary Key)
- `name`
- `address`
- `latitude`
- `longitude`
- `total_spots`
- `hourly_rate`

### Parking Spots
- `spot_id` (Primary Key)
- `parking_lot_id` (Foreign Key)
- `spot_number`
- `is_occupied`
- `is_reserved`

### Reservations
- `reservation_id` (Primary Key)
- `user_id` (Foreign Key)
- `spot_id` (Foreign Key)
- `start_time`
- `end_time`
- `status`

## 🔐 Authentication Flow

1. **Đăng nhập** với email/password hoặc Google
2. **JWT token** được tạo và lưu locally
3. **Profile check** - nếu cần cập nhật thông tin
4. **Navigation** đến main app hoặc profile update

## 📱 Screens

- **Login/Register** - Đăng nhập và đăng ký
- **Home** - Danh sách bãi đỗ xe gần nhất
- **Explore** - Bản đồ và chỉ đường
- **Parking Lot Detail** - Chi tiết bãi đỗ và đặt chỗ
- **Payment** - Thanh toán tiền cọc
- **Profile** - Quản lý thông tin cá nhân

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Project này được phát triển cho mục đích học tập và nghiên cứu.

## 👨‍💻 Tác giả

**Phi Hùng** - [GitHub](https://github.com/Hung06)

---

⭐ Nếu project này hữu ích, hãy cho một star nhé!

