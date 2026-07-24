# AutoParts Pro - Sequence Diagrams (Role-Based Process Flows)

เอกสารนี้รวบรวม Sequence Diagrams ของระบบ **AutoParts Pro** เพื่ออธิบายขั้นตอนการทำงานและการไหลของข้อมูล (Data Flow) ตั้งแต่ฝั่ง Frontend, Backend API, Controllers, Models จนถึง PostgreSQL Database อย่างละเอียดและถูกต้องตามโครงสร้างโค้ดจริง

---

## ส่วนประกอบสำคัญของ Sequence Diagram (UML Components)

ตามที่คุณระบุ ไดอะแกรมเหล่านี้ประกอบไปด้วยองค์ประกอบมาตรฐานของ UML Sequence Diagram ดังนี้:
1. **Actor (ตัวแสดง)**: แทนผู้ใช้งานตามบทบาท (User, Manager, Admin)
2. **Lifeline (เส้นชีวิต)**: เส้นประแนวตั้งที่แสดงถึงระยะเวลาการมีอยู่ของออบเจกต์หรือคอมโพเนนต์นั้นๆ (เช่น Frontend, API Router, Controller, Model, DB)
3. **Activation Bar (แถบการทำงาน)**: แถบสี่เหลี่ยมผืนผ้าแนวตั้งบนเส้น Lifeline แสดงว่าออบเจกต์นั้นกำลังประมวลผลอยู่
4. **Message (ข้อความ/เส้นส่งข้อมูล)**: ลูกศรแนวนอนพร้อมข้อความกำกับที่ส่งจาก Lifeline หนึ่งไปยังอีก Lifeline หนึ่ง

---

## 1. Process Flow ของบทบาท: User (ลูกค้า / ผู้ใช้ทั่วไป)
* **สิทธิ์การเข้าถึง**: เข้าถึง Public APIs และ Private APIs เฉพาะข้อมูลส่วนตัวของตนเอง (สั่งซื้อสินค้า / ดูประวัติการสั่งซื้อของตนเอง)

### ภาพไดอะแกรมของบทบาท User:
![Sequence Diagram User](sequence_diagram_user.png)

### รายละเอียด Flow การทำงาน:
```mermaid
sequenceDiagram
    autonumber
    actor Customer as ลูกค้า (User Actor)
    participant FE as หน้าเว็บ / แอพ (Frontend - Cart & Orders)
    participant Middleware as Auth Middleware (protect)
    participant BE as เซิร์ฟเวอร์ API (Express Router / OrderRoutes.js)
    participant Controller as Order Controller (orderController.js)
    participant DB as ฐานข้อมูล (PostgreSQL Database)

    %% Flow การสั่งซื้อสินค้า
    Note over Customer, DB: [กระบวนการสั่งซื้อสินค้า - Place Order]
    Customer->>FE: กดปุ่มสั่งซื้อสินค้า (Place Order)
    FE->>BE: POST /api/orders { items, totalAmount } พร้อม JWT Token
    BE->>Middleware: ต้อนสอบความถูกต้องของ Token (protect)
    Middleware-->>BE: ผ่านการตรวจสอบ (ระบุ User ID)
    BE->>Controller: เรียกฟังก์ชัน createOrder(req, res)
    Controller->>DB: ตรวจสอบสต็อก และ INSERT ข้อมูลลงตาราง orders
    DB-->>Controller: ส่งคำสั่งซื้อที่สร้างขึ้นกลับมา
    Controller-->>BE: res.status(201).json({ success: true, data: order })
    BE-->>FE: ส่งผลลัพธ์ JSON กลับไป
    FE-->>Customer: แสดงหน้ายืนยันสั่งซื้อสำเร็จ

    %% Flow การดูรายการสั่งซื้อของตัวเอง
    Note over Customer, DB: [กระบวนการดูประวัติการสั่งซื้อ - View My Orders]
    Customer->>FE: คลิกเมนู "ประวัติการสั่งซื้อ" (My Orders)
    FE->>BE: GET /api/orders พร้อม JWT Token
    BE->>Middleware: ตรวจสอบ Token (protect)
    Middleware-->>BE: ผ่านการตรวจสอบ
    BE->>Controller: เรียกฟังก์ชัน getMyOrders(req, res)
    Controller->>DB: Query: SELECT * FROM orders WHERE user_id = $1
    DB-->>Controller: ส่งแถวรายการคำสั่งซื้อของ User รายนั้น
    Controller-->>BE: res.status(200).json({ success: true, data: orders })
    BE-->>FE: ส่งข้อมูลรายการสั่งซื้อในรูปแบบ JSON
    FE-->>Customer: แสดงตารางประวัติการสั่งซื้อในหน้าประวัติ
```

---

## 2. Process Flow ของบทบาท: Manager (ผู้จัดการระบบ)
* **สิทธิ์การเข้าถึง**: ได้รับการคุ้มครองผ่าน Middleware `protect` และ `managerOrAdmin` เพื่อจัดการออเดอร์ทั้งหมดในระบบและเปลี่ยนสถานะคำสั่งซื้อ

### ภาพไดอะแกรมของบทบาท Manager:
![Sequence Diagram Manager](sequence_diagram_manager.png)

### รายละเอียด Flow การทำงาน:
```mermaid
sequenceDiagram
    autonumber
    actor Manager as ผู้จัดการ (Manager Actor)
    participant FE as ระบบหลังบ้าน (Dashboard - Manager Panel)
    participant Middleware as Auth Middleware (managerOrAdmin)
    participant BE as เซิร์ฟเวอร์ API (Express Router / OrderRoutes.js)
    participant Controller as Order Controller (orderController.js)
    participant DB as ฐานข้อมูล (PostgreSQL Database)

    %% Flow การดูออเดอร์ทั้งหมด
    Note over Manager, DB: [กระบวนการดูและจัดการออเดอร์ทั้งหมดในระบบ]
    Manager->>FE: เปิดหน้าจัดการคำสั่งซื้อทั้งหมด
    FE->>BE: GET /api/orders/admin/all พร้อม JWT Token
    BE->>Middleware: ตรวจสอบ JWT (protect) + ตรวจสอบสิทธิ์ (role IN ['admin', 'manager'])
    Middleware-->>BE: ผ่านการตรวจสอบสิทธิ์
    BE->>Controller: เรียกฟังก์ชัน getAllOrders(req, res)
    Controller->>DB: Query: SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id
    DB-->>Controller: ส่งรายการออเดอร์ของลูกค้าทุกคนกลับมา
    Controller-->>BE: res.status(200).json({ success: true, data: orders })
    BE-->>FE: ส่งข้อมูลรายการออเดอร์ทั้งหมดในรูปแบบ JSON
    FE-->>Manager: แสดงรายการออเดอร์ของลูกค้าทั้งหมดในตารางแอดมิน

    %% Flow การอัปเดตสถานะการจัดส่ง
    Note over Manager, DB: [กระบวนการอัปเดตสถานะออเดอร์]
    Manager->>FE: เลือกเปลี่ยนสถานะออเดอร์ (เช่น จาก pending เป็น shipped)
    FE->>BE: PUT /api/orders/:id/status { status: 'shipped' } พร้อม JWT Token
    BE->>Middleware: ตรวจสอบสิทธิ์ (managerOrAdmin)
    Middleware-->>BE: ผ่านการตรวจสอบ
    BE->>Controller: เรียกฟังก์ชัน updateOrderStatus(req, res)
    Controller->>DB: UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *
    DB-->>Controller: อัปเดตข้อมูลและส่งออเดอร์เวอร์ชันใหม่กลับมา
    Controller-->>BE: res.status(200).json({ success: true, data: updatedOrder })
    BE-->>FE: ส่งข้อมูลอัปเดตสำเร็จในรูปแบบ JSON
    FE-->>Manager: แสดงสถานะล่าสุดในตารางการจัดการออเดอร์
```

---

## 3. Process Flow ของบทบาท: Admin (ผู้ดูแลระบบสูงสุด)
* **สิทธิ์การเข้าถึง**: สิทธิ์สูงสุดในระบบ ผ่าน Middleware `protect` และ `adminOnly` สำหรับการจัดการสินค้าทั้งหมด (เพิ่ม/แก้ไข/ลบ) และควบคุมสถานะบทบาท (Role) ของผู้ใช้งานในระบบ

### ภาพไดอะแกรมของบทบาท Admin:
![Sequence Diagram Admin](sequence_diagram_admin.png)

### รายละเอียด Flow การทำงาน:
```mermaid
sequenceDiagram
    autonumber
    actor Admin as ผู้ดูแลระบบ (Admin Actor)
    participant FE as ระบบหลังบ้าน (Admin Dashboard - Products & Users)
    participant Middleware as Auth Middleware (adminOnly)
    participant BE as เซิร์ฟเวอร์ API (Express Router / Product & User Routes)
    participant Controller as Product/User Controller
    participant Model as Product/User Model (Product.js / User.js)
    participant DB as ฐานข้อมูล (PostgreSQL Database)

    %% Flow การสร้างสินค้าใหม่ (Product Creation)
    Note over Admin, DB: [กระบวนการจัดการสินค้า - Add Product]
    Admin->>FE: กรอกข้อมูลสินค้าใหม่และคลิกปุ่มบันทึก
    FE->>BE: POST /api/products { name, price, stock, category } พร้อม JWT Token
    BE->>Middleware: ตรวจสอบ JWT (protect) + ตรวจสอบสิทธิ์ (role === 'admin')
    Middleware-->>BE: ผ่านการตรวจสอบสิทธิ์ Admin
    BE->>Controller: เรียกฟังก์ชัน createProduct(req, res)
    Controller->>Model: เรียก Product.create(data)
    Note over Model: ดึงและตรวจสอบแบรนด์รถ/แบรนด์สินค้า<br/>จากตาราง car_brands และ part_brands
    Model->>DB: INSERT INTO parts (name, price, stock, category, ...) VALUES ($1, $2, ...)
    DB-->>Model: ส่งข้อมูลแถวที่บันทึกสำเร็จกลับมา
    Model-->>Controller: ส่ง Product Object คืนกลับไป
    Controller-->>BE: res.status(201).json({ success: true, data: product })
    BE-->>FE: ส่งข้อมูลสินค้าที่สร้างเสร็จในรูปแบบ JSON
    FE-->>Admin: แสดงสถานะเพิ่มสินค้าเรียบร้อยแล้วบน UI

    %% Flow การปรับสิทธิ์การเข้าถึงของผู้ใช้งาน (User Role Management)
    Note over Admin, DB: [กระบวนการเปลี่ยน Role ผู้ใช้ - Manage User Roles]
    Admin->>FE: ค้นหาผู้ใช้ และเลือกเปลี่ยนบทบาท (เช่น เปลี่ยนจาก user เป็น manager)
    FE->>BE: PUT /api/users/:id/role { role: 'manager' } พร้อม JWT Token
    BE->>Middleware: ตรวจสอบสิทธิ์ Admin (adminOnly)
    Middleware-->>BE: ผ่านการตรวจสอบสิทธิ์ Admin
    BE->>Controller: เรียกฟังก์ชัน updateUserRole(req, res)
    Controller->>DB: UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, role
    DB-->>Controller: ส่งข้อมูลรายละเอียดผู้ใช้ที่มีการเปลี่ยนสิทธิ์
    Controller-->>BE: res.status(200).json({ success: true, data: updatedUser })
    BE-->>FE: ส่งผลการตอบรับสำเร็จแบบ JSON
    FE-->>Admin: อัปเดตรายชื่อและสิทธิ์ล่าสุดในตารางการจัดการผู้ใช้งาน
```
