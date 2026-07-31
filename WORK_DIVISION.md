# เอกสารสรุปการทำงานและบทบาทหน้าที่ของสมาชิกในทีม (Team Contributions)

**โครงการ:** AutoParts Pro - ระบบร้านค้าออนไลน์ขายอุปกรณ์แต่งรถ (E-Commerce)  
**วันที่จัดทำ:** 2026-07-24  

---

## 📌 สรุปภาพรวมและรายชื่อสมาชิกในทีม

| รายชื่อสมาชิก | รหัสนักศึกษา | Git Account ที่ใช้ | บทบาท/หน้าที่หลัก |
| :--- | :---: | :--- | :--- |
| **ณัฐพงศ์ จุลรุจิ** | 67117379 | `Nattapong7557` | Project Lead, System Architecture, Core Frontend & Backend, CI/CD, Test Suite |
| **กษิดิ์เดช เนียมทอง** | 67117355 | `dukubkubpom`, `Kasidech` | Product Data Manager, Inventory Flow Controls, Order UX Improvement |
| **นันทวัฒน์ สังข์นุ้ย** | 67108332 | `AuT160347` | DB Architect (PostgreSQL Migration), Authentication (JWT/RBAC), Admin Dashboard |
| **ณัฐวัฒน์ ปิ่นพันธุ์** | 67117324 | `DESKTOP-500DB7P\usEr` | UI/UX & Filter Components, Brand Categorization, Architecture Diagram Design |
| **ธนชล แจ้งเจริญ** | 67095854 | `Dorkhad` | User Profile Page, Checkout Calculation (VAT 7%), Payment & Media Assets |
| **Gusbo (ทีมทดสอบ)** | - | `GUSZEEKUB\gusbo` | Postman API Test Suite & Postman Testing Report PDF |

---

## 🛠️ รายละเอียดการทำงานและไฟล์ที่รับผิดชอบแบ่งตามบุคคล

### 1. ณัฐพงศ์ จุลรุจิ (Nattapong7557 - 67117379)
* **การทำงานหลัก:**
  * ออกแบบและวางโครงสร้างตั้งต้นของโปรเจกต์ทั้งฝั่ง Frontend และ Backend (Monolithic Modular Architecture)
  * พัฒนาหน้าเว็บหลัก (Home Page), หน้ารายละเอียดสินค้า (Product Detail) และหน้าตะกร้าสินค้า (Cart Page)
  * ออกแบบและพัฒนา RESTful API สำหรับระบบจัดการสินค้า คำสั่งซื้อ และการเชื่อมต่อผู้ใช้
  * จัดทำระบบกรองสินค้าตามแบรนด์รถยนต์ (Car Brand Filter) และหมวดหมู่ผ่าน API
  * จัดทำเอกสารข้อกำหนดระบบ (SRS), แผนภาพสถาปัตยกรรมระบบ (System Architecture Diagram) และตารางทดสอบ User Acceptance Testing (UAT) ใน `README.md`
  * ออกแบบและทดสอบประสิทธิภาพระบบภายใต้สภาวะโหลดสูงด้วย Apache JMeter (500 Concurrent Users)
  * จัดวางระบบ CI/CD ด้วย GitHub Actions สำหรับปรับปรุงหน้าเว็บขึ้น GitHub Pages อัตโนมัติ

* **ไฟล์หลักที่สร้าง/ดูแล:**
  * [README.md](file:///c:/Users/atnun/.gemini/antigravity-ide/scratch/PJ_Car-Accessories/README.md)
  * [checkout_load_test_500users.jmx](file:///c:/Users/atnun/.gemini/antigravity-ide/scratch/PJ_Car-Accessories/checkout_load_test_500users.jmx)
  * `.github/workflows/deploy.yml`
  * `frontend/index.html`, `frontend/pages/product.html`, `frontend/pages/cart.html`
  * `frontend/css/styles.css`, `frontend/css/pages.css`, `frontend/js/app.js`
  * `backend/server.js`
  * `backend/controllers/` (`authController.js`, `orderController.js`, `productController.js`)
  * `backend/routes/` (`authRoutes.js`, `orderRoutes.js`, `productRoutes.js`)
  * `backend/models/` (`User.js`, `Product.js`, `Order.js`)
  * `backend/middleware/` (`auth.js`, `errorHandler.js`)
  * `backend/config/` (`db.js`, `seed.js`)

---

### 2. นันทวัฒน์ สังข์นุ้ย (AuT160347 - 67108332)
* **การทำงานหลัก:**
  * ดำเนินการ Migrate ระบบหลังบ้านไปใช้คลาวด์ฐานข้อมูล **Neon PostgreSQL** และเขียน Native Seeding Script
  * ออกแบบโครงสร้างตารางข้อมูลผู้ใช้งาน (`users`) ตารางสิทธิ์ (`roles`) และจัดการความปลอดภัยด้วย JWT Token
  * พัฒนาหน้าเข้าสู่ระบบ (Login) หน้าสมัครสมาชิก (Register) และหน้าประวัติคำสั่งซื้อ (Orders History)
  * พัฒนาหน้า Dashboard หลังบ้านสำหรับการจัดการคำสั่งซื้อของ Manager/Admin
  * พัฒนาตรรกะการเชื่อมโยงเมนูนำทาง (Header Navigation) ให้สัมพันธ์กับหมวดหมู่สินค้า เช่น สินค้าขายดี สินค้ามาใหม่ และสินค้าโปรโมชั่น

* **ไฟล์หลักที่สร้าง/ดูแล:**
  * [AUTHENTICATION_GUIDE.md](file:///c:/Users/atnun/.gemini/antigravity-ide/scratch/PJ_Car-Accessories/AUTHENTICATION_GUIDE.md)
  * `backend/sql/neon_schema.sql`
  * `backend/execute-schema.js`
  * `frontend/pages/login.html`
  * `frontend/pages/register.html`
  * `frontend/pages/orders.html`
  * `frontend/js/auth.js`
  * `frontend/css/auth.css`

---

### 3. กษิดิ์เดช เนียมทอง (dukubkubpom / Kasidech - 67117355)
* **การทำงานหลัก:**
  * นำเข้าและจัดการข้อมูลสินค้าและรูปภาพกลุ่มอะไหล่แต่งรถ เช่น กันชนหน้า, ฝากระโปรงหน้า, กระจังหน้า, ไฟหน้ารถ และพวงมาลัย
  * ปรับปรุง UX/UI การแสดงผลสถานะออเดอร์ (เช่น ปรับเปลี่ยนสถานะเริ่มต้นเป็น 'รอจัดส่ง' สีเขียว)
  * จัดการการแสดงผลหมายเลขคำสั่งซื้อแบบรันลำดับ (`สั่งซื้อสำเร็จ #...`) และจัดเรียงรายการสั่งซื้อตามเวลา
  * เพิ่มปุ่ม "กลับหน้าหลัก" (Back to Home) บนหน้าออเดอร์พร้อมสไตล์ตามธีมเว็บ
  * เขียนตรรกะจัดการสถานะสินค้า (`is_active`) โดยอิงตามจำนวนสต๊อกสินค้าคงเหลือ

* **ไฟล์หลักที่สร้าง/ดูแล:**
  * รูปภาพสินค้าใน `frontend/assets/images/products/` โฟลเดอร์ `Front_grille/`, `Car headlights/`, `Car bumper/`, `Car hood/`
  * โค้ดปรับแต่ง UX และการจัดการ Stock ใน `frontend/js/app.js` และหน้าสั่งซื้อ

---

### 4. ณัฐวัฒน์ ปิ่นพันธุ์ (DESKTOP-500DB7P\usEr - 67117324)
* **การทำงานหลัก:**
  * ออกแบบภาพไดอะแกรมสถาปัตยกรรมระดับลึก **Mermaid Diagrams** 5 มุมมอง (Simple, Detailed, Patterns, SOLID, Platforms) สำหรับเมนูเฉพาะผู้ดูแลระบบ (Admin)
  * พัฒนากล่องเลือกตัวกรองแบรนด์รถยนต์และหมวดหมู่ (Dropdown Checkbox Components)
  * ปรับปรุงเรื่องสีสัน Layout และการค้นหาสินค้าทั่วไป (General Products)

* **ไฟล์หลักที่สร้าง/ดูแล:**
  * รูปภาพยี่ห้อรถยนต์ใน `frontend/assets/images/brandcar/` (`honda.png`, `toyota.png`, `nissan.png`, `mazda.png`, `isuzu.png`, `mitsubishi.png`)
  * โค้ดส่วน Diagram ในระบบหลังบ้าน และส่วนประกอบ UI Dropdown Checkbox

---

### 5. ธนชล แจ้งเจริญ (Dorkhad - 67095854)
* **การทำงานหลัก:**
  * พัฒนาหน้าแสดงและแก้ไขข้อมูลส่วนตัวผู้ใช้ (User Profile)
  * เพิ่มฟังก์ชันการคำนวณและแสดงค่าภาษีมูลค่าเพิ่ม (VAT 7%) และที่อยู่จัดส่งในกระบวนการชำระเงิน
  * เพิ่มการแสดงผลสต๊อกคงเหลือในหน้าสินค้า
  * รวบรวมและนำเข้าสื่อรูปภาพสินค้าหมวดล้อแม็กซ์ (Wheel) และเบาะแต่งรถยนต์ (Car seat)

* **ไฟล์หลักที่สร้าง/ดูแล:**
  * รูปภาพสินค้าใน `frontend/assets/images/products/Wheel/` และ `Car seat/`
  * โค้ดคำนวณราคา VAT 7% และการจัดการโปรไฟล์ใน Frontend

---

### 6. Gusbo (GUSZEEKUB\gusbo)
* **การทำงานหลัก:**
  * ออกแบบและอัปเดตชุดทดสอบ API บน **Postman Collection & Environment** ให้ครอบคลุมทุก Endpoint
  * ทำการทดสอบและจัดทำรายงานสรุปผลการทดสอบ API ในรูปแบบไฟล์ PDF

* **ไฟล์หลักที่สร้าง/ดูแล:**
  * [Report_Postman_AutoParts.pdf](file:///c:/Users/atnun/.gemini/antigravity-ide/scratch/PJ_Car-Accessories/Report_Postman_AutoParts.pdf)
  * [AutoParts_Pro_Collection.postman_collection.json](file:///c:/Users/atnun/.gemini/antigravity-ide/scratch/PJ_Car-Accessories/AutoParts_Pro_Collection.postman_collection.json)
  * [AutoParts_Local.postman_environment.json](file:///c:/Users/atnun/.gemini/antigravity-ide/scratch/PJ_Car-Accessories/AutoParts_Local.postman_environment.json)

---

> เอกสารฉบับนี้สร้างขึ้นเพื่อใช้ประกอบการรายงานผลการดำเนินงานและการแบ่งหน้าที่ภายในทีม AutoParts Pro
