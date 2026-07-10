## ระบบ Login & Register - AutoParts Pro

สร้างระบบ authentication แบบสมบูรณ์ด้วย Login & Register พร้อม UI ที่สวยงามและการจัดการ User State

### 📋 รายละเอียดของการเปลี่ยนแปลง

#### 1. ฐานข้อมูล (Database)
- **เพิ่มตาราง `roles`**: จัดเก็บข้อมูล role (admin, user, manager)
- **อัปเดตตาราง `users`**: เปลี่ยนจาก `role` (varchar) เป็น `role_id` (foreign key)
- **Indexes**: เพิ่ม index บน `users.role_id` เพื่อเพิ่มประสิทธิภาพ

```sql
-- ฐานข้อมูลมีการ join ระหว่าง users และ roles
SELECT u.*, r.name as role_name 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id
```

#### 2. Frontend - หน้าต่างๆ

**register.html** - หน้าสมัครสมาชิก
- ฟอร์มกรอกข้อมูล: ชื่อ, อีเมล, เบอร์โทร, รหัสผ่าน
- Validation แบบ real-time
- ปุ่มสมัครสมาชิกพร้อม loading spinner
- Redirect ไปยังหน้าแรกหลังสมัครสำเร็จ

**login.html** - หน้าเข้าสู่ระบบ
- ฟอร์มกรอกข้อมูล: อีเมล, รหัสผ่าน
- ฟีเจอร์ "จำรหัสผ่าน" (Remember Me)
- Error handling
- Redirect ไปยังหน้าแรกหลังเข้าสู่ระบบสำเร็จ

**orders.html** - หน้าแสดงรายการสั่งซื้อ
- Protected route (ต้องเข้าสู่ระบบ)
- แสดงรายการสั่งซื้อของ user
- สถานะการสั่งซื้อและการจัดส่ง

#### 3. Frontend - JavaScript

**auth.js** (ไฟล์ใหม่)
```javascript
// การลงทะเบียน
handleRegister(e) // ส่งข้อมูลไปยัง API

// การเข้าสู่ระบบ
handleLogin(e) // ส่งข้อมูล login ไปยัง API

// การจัดการ Token
saveAuthToken(token)   // บันทึก token ลง localStorage
getAuthToken()         // ดึง token จาก localStorage
clearAuthToken()       // ลบ token

// ตรวจสอบสถานะ
isUserLoggedIn()       // ตรวจสอบว่า user login หรือไม่
getCurrentUser()       // ดึงข้อมูล user ปัจจุบัน

// Logout
logout()               // ออกจากระบบ
```

**app.js** (อัปเดต)
```javascript
// ตรวจสอบและอัปเดต UI
updateAuthUI() // แสดง/ซ่อน login button ตามสถานะ

// User Menu
showUserMenu() // แสดง dropdown menu กับตัวเลือก:
              // - ชื่อและอีเมลของ user
              // - ลิงก์ไปตะกร้า
              // - ลิงก์ไปรายการสั่งซื้อ
              // - ปุ่ม Logout
```

#### 4. Frontend - Styling

**auth.css** (ไฟล์ใหม่)
- สไตล์สำหรับหน้า Login/Register
- Form validation styling
- Error/Success messages
- Loading spinner animation
- Responsive design (mobile-first)

**styles.css** (อัปเดต)
- `.user-menu` - สไตล์ dropdown menu
- User profile display
- Menu items with icons

#### 5. Backend - Model Updates

**User.js** (อัปเดต)
```javascript
// mapUserRow() - อัปเดตให้รองรับ role_id
{
  role: row.role || 'user',  // backward compatibility
  roleId: row.role_id        // foreign key
}

// create() - ดึง role_id จากตาราง roles
// save() - ใช้ role_id ในการ update

// Password hashing ด้วย bcrypt
comparePassword()  // เปรียบเทียบ password
```

### 🔄 Flow การทำงาน

#### สมัครสมาชิก
```
1. User ไปที่ register.html
2. กรอกข้อมูล: ชื่อ, อีเมล, โทร, รหัสผ่าน
3. ส่งไปยัง POST /api/auth/register
4. Backend:
   - ตรวจสอบอีเมลว่าซ้ำหรือไม่
   - Hash รหัสผ่าน
   - บันทึกลงฐานข้อมูล
   - สร้าง JWT token
   - ส่งกลับ token
5. Frontend:
   - บันทึก token ลง localStorage
   - บันทึกข้อมูล user
   - Redirect ไปหน้าแรก
```

#### เข้าสู่ระบบ
```
1. User ไปที่ login.html
2. กรอกอีเมลและรหัสผ่าน
3. ส่งไปยัง POST /api/auth/login
4. Backend:
   - ตรวจสอบอีเมล
   - เปรียบเทียบรหัสผ่าน
   - สร้าง JWT token
   - ส่งกลับ token
5. Frontend:
   - บันทึก token
   - บันทึกข้อมูล user
   - Redirect ไปหน้าแรก
6. บน index.html:
   - updateAuthUI() ทำการอัปเดต login button
   - แสดงชื่อ user แทน "ลงชื่อเข้าใช้"
```

#### ออกจากระบบ
```
1. User คลิก logout button ใน dropdown menu
2. ลบ token จาก localStorage
3. ลบข้อมูล user
4. Reload หน้า
5. ป้อนบาก version ของ index.html (ไม่ login)
```

### 🔐 การรักษาความปลอดภัย

- **Password Hashing**: ใช้ bcrypt เพื่อ hash รหัสผ่าน
- **JWT Token**: สร้าง token ที่มีอายุการใช้งาน 7 วัน
- **Protected Routes**: API endpoints ต้องส่ง valid token
- **CORS**: กำหนด origin ที่ยอมรับ

### 📱 Features

✅ User Registration & Login
✅ JWT Token Authentication
✅ Password Hashing (bcrypt)
✅ User Profile Dropdown
✅ Order History Page
✅ Protected Routes
✅ Remember Me Functionality
✅ Form Validation
✅ Error Handling
✅ Responsive Design
✅ Dark Theme UI
✅ Thai Language Support

### 🚀 การใช้งาน

1. **สมัครสมาชิกใหม่**
   - ไปที่ `http://localhost:5000/frontend/pages/register.html`
   - กรอกข้อมูลและคลิกสมัครสมาชิก

2. **เข้าสู่ระบบ**
   - ไปที่ `http://localhost:5000/frontend/pages/login.html`
   - กรอกอีเมลและรหัสผ่าน

3. **ดูรายการสั่งซื้อ**
   - เข้าสู่ระบบก่อน
   - คลิก "รายการสั่งซื้อ" จาก user menu

### 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | สมัครสมาชิก |
| POST | /api/auth/login | เข้าสู่ระบบ |
| GET | /api/auth/me | ดึงข้อมูล user (protected) |
| PUT | /api/auth/profile | อัปเดตโปรไฟล์ (protected) |
| PUT | /api/auth/password | เปลี่ยนรหัสผ่าน (protected) |

### 📂 ไฟล์ที่สร้าง/อัปเดต

**สร้างใหม่:**
- `frontend/pages/register.html` - หน้าสมัครสมาชิก
- `frontend/pages/login.html` - หน้าเข้าสู่ระบบ
- `frontend/pages/orders.html` - หน้ารายการสั่งซื้อ
- `frontend/js/auth.js` - ฟังก์ชั่น authentication
- `frontend/css/auth.css` - สไตล์ authentication

**อัปเดต:**
- `backend/sql/neon_schema.sql` - เพิ่มตาราง roles และอัปเดต users
- `backend/models/User.js` - รองรับ role_id
- `frontend/js/app.js` - เพิ่ม auth functions และ user menu
- `frontend/css/styles.css` - เพิ่ม user-menu styles

### ⚙️ Config Required

ตรวจสอบ `.env` ใน backend:
```
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=*
```

---
สร้างเมื่อ: 2026-07-10
