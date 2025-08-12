# Manager Bank Account API Documentation

## Tổng quan
API này quản lý thông tin tài khoản ngân hàng của các manager trong hệ thống, tuân theo chuẩn VietQR. Chỉ những user có role 'manager' hoặc 'admin' mới có quyền truy cập các chức năng này.

## Endpoints

### 1. Lấy danh sách tài khoản ngân hàng của manager hiện tại
```
GET /api/manager/bank-accounts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "account_id": 1,
      "user_id": 2,
      "bank_code": "970414",
      "bank_name": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
      "account_number": "1234567890",
      "account_name": "NGUYEN VAN A",
      "is_active": true,
      "created_at": "2024-01-17T10:00:00.000Z",
      "updated_at": "2024-01-17T10:00:00.000Z",
      "manager_name": "Nguyễn Văn A",
      "manager_email": "manager1@gmail.com"
    }
  ]
}
```

### 2. Lấy chi tiết một tài khoản ngân hàng
```
GET /api/manager/bank-accounts/:accountId
Authorization: Bearer <token>
```

### 3. Tạo tài khoản ngân hàng mới
```
POST /api/manager/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "bank_code": "970414",
  "bank_name": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
  "account_number": "1234567890",
  "account_name": "NGUYEN VAN A"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo tài khoản ngân hàng thành công",
  "data": {
    "account_id": 1,
    "user_id": 2,
    "bank_code": "970414",
    "bank_name": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    "account_number": "1234567890",
    "account_name": "NGUYEN VAN A",
    "is_active": true,
    "created_at": "2024-01-17T10:00:00.000Z",
    "updated_at": "2024-01-17T10:00:00.000Z",
    "manager_name": "Nguyễn Văn A",
    "manager_email": "manager1@gmail.com"
  }
}
```

### 4. Cập nhật tài khoản ngân hàng
```
PUT /api/manager/bank-accounts/:accountId
Authorization: Bearer <token>
Content-Type: application/json

{
  "bank_code": "970414",
  "bank_name": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
  "account_number": "1234567890",
  "account_name": "NGUYEN VAN UPDATED",
  "is_active": true
}
```

### 5. Xóa tài khoản ngân hàng (soft delete)
```
DELETE /api/manager/bank-accounts/:accountId
Authorization: Bearer <token>
```

### 6. Lấy tất cả tài khoản ngân hàng (cho admin)
```
GET /api/admin/bank-accounts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "account_id": 1,
      "user_id": 2,
      "bank_code": "970414",
      "bank_name": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
      "account_number": "1234567890",
      "account_name": "NGUYEN VAN A",
      "is_active": true,
      "created_at": "2024-01-17T10:00:00.000Z",
      "updated_at": "2024-01-17T10:00:00.000Z",
      "manager_name": "Nguyễn Văn A",
      "manager_email": "manager1@gmail.com",
      "user_role": "manager"
    }
  ]
}
```

### 7. Lấy danh sách mã ngân hàng VietQR
```
GET /api/bank-codes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "970414",
      "name": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)"
    },
    {
      "code": "970415",
      "name": "Ngân hàng TMCP Công thương Việt Nam (VietinBank)"
    }
  ]
}
```

## Cấu trúc dữ liệu

### ManagerBankAccount
```typescript
interface ManagerBankAccount {
  account_id: number;
  user_id: number;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manager_name?: string;
  manager_email?: string;
  user_role?: string;
}
```

### BankCode
```typescript
interface BankCode {
  code: string;
  name: string;
}
```

## Quyền truy cập

### Manager (role: 'manager')
- Xem danh sách tài khoản ngân hàng của mình
- Tạo tài khoản ngân hàng mới
- Cập nhật tài khoản ngân hàng của mình
- Xóa tài khoản ngân hàng của mình
- Xem danh sách mã ngân hàng VietQR

### Admin (role: 'admin')
- Tất cả quyền của manager
- Xem tất cả tài khoản ngân hàng của tất cả manager
- Cập nhật tài khoản ngân hàng của bất kỳ manager nào
- Xóa tài khoản ngân hàng của bất kỳ manager nào

### User (role: 'user')
- Chỉ có thể xem danh sách mã ngân hàng VietQR

## Validation

### Tạo/Cập nhật tài khoản ngân hàng
- `bank_code`: Bắt buộc, phải là mã ngân hàng hợp lệ theo chuẩn VietQR
- `bank_name`: Bắt buộc, tên ngân hàng
- `account_number`: Bắt buộc, số tài khoản
- `account_name`: Bắt buộc, tên chủ tài khoản
- `is_active`: Tùy chọn, mặc định là `true`

### Kiểm tra trùng lặp
- Hệ thống kiểm tra xem tài khoản ngân hàng đã tồn tại chưa dựa trên `user_id`, `bank_code`, và `account_number`
- Không cho phép tạo tài khoản trùng lặp

## Mã ngân hàng VietQR được hỗ trợ

Hệ thống hỗ trợ các mã ngân hàng chính theo chuẩn VietQR:

- **970414**: Vietcombank
- **970415**: VietinBank
- **970405**: BIDV
- **970436**: TPBank
- **970407**: Techcombank
- **970408**: MB Bank
- **970409**: LienVietPostBank
- **970410**: Agribank
- **970411**: VIB
- **970412**: VPBank
- **970413**: ACB
- Và nhiều ngân hàng khác...

## Lỗi thường gặp

### 400 Bad Request
```json
{
  "success": false,
  "message": "Vui lòng điền đầy đủ thông tin tài khoản ngân hàng"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Chỉ manager mới có quyền truy cập thông tin tài khoản ngân hàng"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy tài khoản ngân hàng"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Tài khoản ngân hàng này đã tồn tại"
}
```

## Ví dụ sử dụng

### Tạo tài khoản ngân hàng mới
```javascript
const response = await fetch('/api/manager/bank-accounts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bank_code: '970414',
    bank_name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    account_number: '1234567890',
    account_name: 'NGUYEN VAN A'
  })
});
```

### Lấy danh sách tài khoản ngân hàng
```javascript
const response = await fetch('/api/manager/bank-accounts', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
const data = await response.json();
console.log(data.data); // Danh sách tài khoản
```

### Lấy danh sách mã ngân hàng
```javascript
const response = await fetch('/api/bank-codes', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
const data = await response.json();
console.log(data.data); // Danh sách mã ngân hàng
```

## Lưu ý

1. **Bảo mật**: Tất cả API đều yêu cầu authentication token
2. **Quyền truy cập**: Chỉ manager và admin mới có quyền quản lý tài khoản ngân hàng
3. **Validation**: Hệ thống kiểm tra mã ngân hàng theo chuẩn VietQR
4. **Soft Delete**: Khi xóa tài khoản, hệ thống chỉ đánh dấu `is_active = false`, không xóa dữ liệu
5. **Trùng lặp**: Không cho phép tạo tài khoản trùng lặp cho cùng một user
6. **Audit**: Hệ thống lưu trữ thời gian tạo và cập nhật cho mỗi tài khoản

## Database Schema

```sql
CREATE TABLE manager_bank_accounts (
  account_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  bank_code VARCHAR(10) NOT NULL COMMENT 'Mã ngân hàng theo chuẩn VietQR',
  bank_name VARCHAR(100) NOT NULL COMMENT 'Tên ngân hàng',
  account_number VARCHAR(50) NOT NULL COMMENT 'Số tài khoản',
  account_name VARCHAR(100) NOT NULL COMMENT 'Tên chủ tài khoản',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_bank (user_id, bank_code, account_number)
);
```
