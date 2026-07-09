# AutoParts Pro - Car Accessories E-Commerce

เว็บไซต์ E-Commerce สำหรับขายอุปกรณ์แต่งรถเก๋ง (Frontend + Backend)

## 🚗 คุณสมบัติ

### Frontend
- **หน้าแรก** - แสดงสินค้าแนะนำ, แบนเนอร์โปรโมชั่น, Carousel อัตโนมัติ
- **หน้ารายละเอียดสินค้า** - แสดงรูปภาพ, รายละเอียด, ราคา, ปุ่มเพิ่มลงตะกร้า
- **ตะกร้าสินค้า** - จัดการสินค้า, เพิ่ม/ลดจำนวน, สรุปยอดรวม
- **ระบบค้นหา** - ค้นหาสินค้าตามชื่อ, แบรนด์
- **กรองตามหมวดหมู่** - โปรโมชั่น, สินค้าใหม่, ขายดี
- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **Dark Theme** - ธีมมืดพรีเมียมสำหรับร้านอุปกรณ์รถยนต์

### Backend
- **RESTful API** - Express.js API server
- **Authentication** - สมัครสมาชิก / เข้าสู่ระบบ ด้วย JWT
- **Product Management** - CRUD สินค้า (Admin)
- **Order Management** - สร้าง / ติดตามคำสั่งซื้อ
- **Role-Based Access** - แยกสิทธิ์ User / Admin
- **MongoDB** - ฐานข้อมูล NoSQL พร้อม Mongoose ODM

## 🛠 เทคโนโลยี

### Frontend
- HTML5 / CSS3 / JavaScript (Vanilla)
- Google Fonts (Inter, Kanit)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token)
- bcrypt.js

## 📂 โครงสร้างโปรเจกต์

```
PJ_Car-Accessories/
├── frontend/                   # Frontend (Static Website)
│   ├── index.html              # หน้าแรก
│   ├── css/
│   │   ├── styles.css          # Stylesheet หลัก
│   │   └── pages.css           # Styles หน้าย่อย
│   ├── js/
│   │   └── app.js              # JavaScript หลัก
│   ├── pages/
│   │   ├── product.html        # หน้ารายละเอียดสินค้า
│   │   └── cart.html           # หน้าตะกร้าสินค้า
│   └── assets/
│       └── images/
│           ├── logo.png
│           ├── banners/
│           └── products/
│
├── backend/                    # Backend (API Server)
│   ├── server.js               # Entry point
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   ├── .env.example            # Env template
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── seed.js             # Database seeder
│   ├── models/
│   │   ├── Product.js          # Product model
│   │   ├── User.js             # User model
│   │   └── Order.js            # Order model
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── authController.js
│   │   └── orderController.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── authRoutes.js
│   │   └── orderRoutes.js
│   └── middleware/
│       ├── auth.js             # JWT middleware
│       └── errorHandler.js     # Error handler
│
├── .gitignore
└── README.md
```

## 🚀 วิธีใช้งาน

### 1. Clone repository
```bash
git clone https://github.com/Nattapong7557/PJ_Car-Accessories.git
cd PJ_Car-Accessories
```

### 2. ติดตั้ง Backend dependencies
```bash
cd backend
npm install
```

### 3. ตั้งค่า Environment Variables
```bash
cp .env.example .env
# แก้ไข .env ตามต้องการ (MongoDB URI, JWT Secret)
```

### 4. Seed ข้อมูลเริ่มต้น (ต้องมี MongoDB ทำงานอยู่)
```bash
node config/seed.js
```

### 5. รัน Backend Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

### 6. เปิดเว็บไซต์
เข้า http://localhost:5000

## 📡 API Endpoints

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | ดึงสินค้าทั้งหมด | - |
| GET | `/api/products/:id` | ดึงสินค้าตาม ID | - |
| POST | `/api/products` | สร้างสินค้าใหม่ | Admin |
| PUT | `/api/products/:id` | แก้ไขสินค้า | Admin |
| DELETE | `/api/products/:id` | ลบสินค้า | Admin |

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | สมัครสมาชิก | - |
| POST | `/api/auth/login` | เข้าสู่ระบบ | - |
| GET | `/api/auth/me` | ดึงข้อมูล user | User |
| PUT | `/api/auth/profile` | แก้ไขโปรไฟล์ | User |
| PUT | `/api/auth/password` | เปลี่ยนรหัสผ่าน | User |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | สร้างคำสั่งซื้อ | User |
| GET | `/api/orders` | ดึง orders ของ user | User |
| GET | `/api/orders/:id` | ดึง order ตาม ID | User |
| GET | `/api/orders/admin/all` | ดึง orders ทั้งหมด | Admin |
| PUT | `/api/orders/:id/status` | อัปเดตสถานะ | Admin |

## 👥 ทีมพัฒนา

- Nattapong7557

## 📝 License

MIT License
