# Backend API - Hệ thống Bãi đỗ xe

## Cài đặt và Cấu hình

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Database
Tạo file `.env` trong thư mục backend với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parking_system
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Tạo Database
Tạo database MySQL với tên `parking_system` và chạy các script SQL để tạo bảng:

```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  license_plate VARCHAR(20),
  role ENUM('user', 'manager', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_lots (
  lot_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  address VARCHAR(255),
  total_spots INT UNSIGNED DEFAULT 0,
  price_per_hour DECIMAL(10,2) DEFAULT 0.00,
  manager_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE parking_spots (
  spot_id INT PRIMARY KEY AUTO_INCREMENT,
  lot_id INT NOT NULL,
  spot_number VARCHAR(10) NOT NULL,
  spot_type ENUM('standard','vip','ev') DEFAULT 'standard',
  is_occupied BOOLEAN DEFAULT FALSE,
  is_reserved BOOLEAN DEFAULT FALSE,
  reserved_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lot_id) REFERENCES parking_lots(lot_id) ON DELETE CASCADE,
  FOREIGN KEY (reserved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE reservations (
  reservation_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  reserved_at DATETIME NOT NULL,
  expected_start DATETIME NOT NULL,
  expected_end DATETIME,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (spot_id) REFERENCES parking_spots(spot_id)
);

CREATE TABLE parking_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  entry_time DATETIME NOT NULL,
  exit_time DATETIME,
  total_minutes INT,
  fee DECIMAL(10,2),
  status ENUM('in','out','cancelled') DEFAULT 'in',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (spot_id) REFERENCES parking_spots(spot_id)
);

CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  log_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash','momo','banking','visa','other') DEFAULT 'cash',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (log_id) REFERENCES parking_logs(log_id)
);
```

### 4. Tạo User Admin
```bash
node createAdmin.js
```

### 5. Seed dữ liệu mẫu
```bash
node seedParkingLots.js
```

### 6. Chạy Server
```bash
# Development
npm run dev

# Production
npm start
```

### 7. Test API (Tùy chọn)
```bash
# Cài đặt axios nếu chưa có
npm install axios

# Chạy test API
node testAPI.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google` - Đăng nhập Google

### Parking Lots
- `GET /api/parking-lots` - Lấy danh sách bãi đỗ xe
- `GET /api/parking-lots/:id` - Lấy chi tiết bãi đỗ xe
- `GET /api/parking-lots/search` - Tìm kiếm bãi đỗ xe
- `POST /api/parking-lots` - Tạo bãi đỗ xe mới (Admin/Manager)
- `PUT /api/parking-lots/:id` - Cập nhật bãi đỗ xe (Admin/Manager)
- `DELETE /api/parking-lots/:id` - Xóa bãi đỗ xe (Admin/Manager)

## Cấu trúc Project

```
backend/
├── config/
│   └── database.js          # Cấu hình MySQL
├── controllers/
│   ├── AuthController.js    # Xử lý authentication
│   └── ParkingLotController.js # Xử lý bãi đỗ xe
├── middlewares/
│   └── authMiddleware.js    # Middleware xác thực JWT
├── models/
│   ├── UserModel.js         # Model User
│   └── ParkingLotModel.js   # Model Parking Lot
├── routes/
│   ├── authRoutes.js        # Routes authentication
│   └── parkingLotRoutes.js  # Routes bãi đỗ xe
├── app.js                   # Entry point
├── seedParkingLots.js       # Script seed dữ liệu
└── package.json
```
