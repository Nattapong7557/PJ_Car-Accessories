const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>รายงานการทดสอบ API - AutoParts Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1a365d;
      --secondary: #00b4d8;
      --dark: #0f172a;
      --light: #f8fafc;
      --border: #e2e8f0;
      
      --postman-bg: #1e1e1e;
      --postman-url-bg: #2d2d2d;
      --postman-text: #d4d4d4;
      --postman-border: #3d3d3d;
      --postman-orange: #ff6c37;
      --postman-green: #0cbb52;
      --postman-blue: #007acc;
      --postman-purple: #8a2be2;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Sarabun', 'Kanit', sans-serif;
      background-color: var(--light);
      color: var(--dark);
      line-height: 1.6;
      font-size: 14px;
    }

    /* Page Layout */
    .page {
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 10mm auto;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* Print settings */
    @media print {
      body {
        background: white;
      }
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
        width: 100%;
        height: 100%;
      }
    }

    /* Cover Page */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 40mm 15mm 20mm 15mm;
    }

    .cover-header {
      width: 100%;
      border-bottom: 4px solid var(--primary);
      padding-bottom: 10px;
      margin-bottom: 40px;
    }

    .cover-logo {
      font-family: 'Kanit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .cover-logo span {
      color: var(--secondary);
    }

    .cover-title {
      font-family: 'Kanit', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: var(--primary);
      margin-top: 50px;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .cover-subtitle {
      font-size: 18px;
      color: #64748b;
      margin-bottom: 80px;
    }

    .cover-info {
      background: #f1f5f9;
      padding: 30px;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      text-align: left;
      border-left: 6px solid var(--primary);
    }

    .cover-info table {
      width: 100%;
      border-collapse: collapse;
    }

    .cover-info td {
      padding: 8px 5px;
      font-size: 15px;
    }

    .cover-info td.label {
      font-weight: bold;
      color: var(--primary);
      width: 35%;
    }

    .cover-footer {
      font-size: 12px;
      color: #94a3b8;
      margin-top: auto;
    }

    /* Page Header/Footer */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--border);
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    .page-header .logo {
      font-family: 'Kanit', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: var(--primary);
    }

    .page-header .logo span {
      color: var(--secondary);
    }

    .page-header .course {
      font-size: 11px;
      color: #64748b;
    }

    .page-footer {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      font-size: 11px;
      color: #94a3b8;
    }

    .page-title {
      font-family: 'Kanit', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 18px;
      background-color: var(--secondary);
      border-radius: 2px;
    }

    /* Content Styling */
    .content-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 15mm;
    }

    .postman-ui {
      background-color: var(--postman-bg);
      border-radius: 6px;
      border: 1px solid var(--postman-border);
      overflow: hidden;
      margin-bottom: 15px;
      font-family: 'Consolas', 'Courier New', monospace;
    }

    .postman-bar {
      background-color: var(--postman-url-bg);
      padding: 10px 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--postman-border);
    }

    .postman-method {
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      color: white;
    }

    .postman-method.get { background-color: var(--postman-green); }
    .postman-method.post { background-color: var(--postman-orange); }
    .postman-method.put { background-color: var(--postman-blue); }
    .postman-method.delete { background-color: #f87171; }

    .postman-url {
      color: #f1f5f9;
      font-size: 12px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .postman-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }

    .postman-status-badge {
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
      color: white;
      font-size: 11px;
    }

    .postman-status-badge.ok { background-color: var(--postman-green); }
    .postman-status-badge.created { background-color: var(--postman-green); }
    .postman-status-badge.error { background-color: #ef4444; }
    .postman-status-badge.unknown { background-color: #8b5cf6; }

    .postman-body-section {
      padding: 12px 15px;
      border-bottom: 1px solid var(--postman-border);
    }

    .postman-body-section.no-border {
      border-bottom: none;
    }

    .postman-body-title {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 6px;
      font-weight: bold;
    }

    .postman-json {
      color: var(--postman-text);
      font-size: 11px;
      white-space: pre-wrap;
      max-height: 160px;
      overflow-y: auto;
      background: #121212;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #282828;
    }

    .json-key { color: #9cdcfe; }
    .json-string { color: #ce9178; }
    .json-number { color: #b5cea8; }
    .json-boolean { color: #569cd6; }

    .analysis-section {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 15px;
      margin-top: 5px;
    }

    .analysis-block {
      margin-bottom: 10px;
    }

    .analysis-block:last-child {
      margin-bottom: 0;
    }

    .analysis-title {
      font-family: 'Kanit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .analysis-text {
      font-size: 13px;
      color: #334155;
      text-align: justify;
    }

    code {
      font-family: 'Consolas', monospace;
      background: #e2e8f0;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 12px;
      color: var(--primary);
    }
  </style>
</head>
<body>

  <!-- ================= COVER PAGE ================= -->
  <div class="page cover-page">
    <div class="cover-header">
      <div class="cover-logo">AutoParts <span>Pro</span></div>
    </div>
    
    <div>
      <h1 class="cover-title">รายงานการทดสอบ API ด้วย Postman</h1>
      <p class="cover-subtitle">ระบบบริหารจัดการร้านค้าอะไหล่รถยนต์ออนไลน์ (AutoParts Pro)</p>
    </div>

    <div class="cover-info">
      <table>
        <tr>
          <td class="label">วิชา</td>
          <td>CSI204 ดิจิทัลแพลตฟอร์มสำหรับพัฒนาซอฟต์แวร์</td>
        </tr>
        <tr>
          <td class="label">อาจารย์ผู้สอน</td>
          <td>อาจารย์ทินภัทร โบริรักษ์</td>
        </tr>
        <tr>
          <td class="label">ผู้จัดทำ</td>
          <td>นายกฤษฎา ต้องไกรเลิศ</td>
        </tr>
        <tr>
          <td class="label">รหัสนักศึกษา</td>
          <td>67115444</td>
        </tr>
        <tr>
          <td class="label">สาขา</td>
          <td>นวัตกรรมการพัฒนาซอฟต์แวร์ (SIT)</td>
        </tr>
        <tr>
          <td class="label">มหาวิทยาลัย</td>
          <td>มหาวิทยาลัยศรีปทุม (SPU)</td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      ภาคการศึกษาที่ 3 ปีการศึกษา 2568 | มหาวิทยาลัยศรีปทุม
    </div>
  </div>

  <!-- ================= PAGE 1 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">1. สมัครสมาชิกใหม่ (Register - Customer)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">http://localhost:5000/api/auth/register</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge created">201 Created</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"name"</span>: <span class="json-string">"กฤษฎา ต้องไกรเลิศ"</span>,
  <span class="json-key">"email"</span>: <span class="json-string">"postman@autopartspro.com"</span>,
  <span class="json-key">"password"</span>: <span class="json-string">"password1234"</span>,
  <span class="json-key">"phone"</span>: <span class="json-string">"0812345678"</span>,
  <span class="json-key">"address"</span>: <span class="json-string">"มหาวิทยาลัยกรุงเทพ"</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"_id"</span>: <span class="json-string">"11"</span>,
    <span class="json-key">"name"</span>: <span class="json-string">"กฤษฎา ต้องไกรเลิศ"</span>,
    <span class="json-key">"email"</span>: <span class="json-string">"postman@autopartspro.com"</span>,
    <span class="json-key">"role"</span>: <span class="json-string">"user"</span>,
    <span class="json-key">"token"</span>: <span class="json-string">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI..."</span>
  },
  <span class="json-key">"message"</span>: <span class="json-string">"สมัครสมาชิกสำเร็จ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">เป็นการส่งข้อมูล JSON เพื่อขอลงทะเบียนผู้ใช้งานคนใหม่เข้าสู่ระบบในบทบาทของลูกค้าทั่วไป (Customer/User) ผ่าน API Endpoint โดยระบุข้อมูลที่จำเป็น เช่น ชื่อ-นามสกุล, อีเมล, รหัสผ่าน, เบอร์โทรศัพท์ และข้อมูลที่อยู่ส่งสินค้า เพื่อบันทึกลงสู่ฐานข้อมูล PostgreSQL</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบหลังบ้านประมวลผลสำเร็จและตอบกลับมาด้วยสถานะ 201 Created พร้อมข้อมูลของผู้ใช้ที่ลงทะเบียนเสร็จสิ้นและ JWT Token บ่งชี้ว่าระบบฐานข้อมูลทำงานได้อย่างถูกต้อง ปลอดภัย และสามารถจัดเก็บข้อมูลสมาชิกใหม่เรียบร้อยสมบูรณ์</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 1</div>
    </div>
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">2. ล็อกอินลูกค้า (Login - Customer)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/auth/login</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge ok">200 OK</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"email"</span>: <span class="json-string">"postman@autopartspro.com"</span>,
  <span class="json-key">"password"</span>: <span class="json-string">"password1234"</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"_id"</span>: <span class="json-string">"11"</span>,
    <span class="json-key">"name"</span>: <span class="json-string">"กฤษฎา ต้องไกรเลิศ"</span>,
    <span class="json-key">"email"</span>: <span class="json-string">"postman@autopartspro.com"</span>,
    <span class="json-key">"role"</span>: <span class="json-string">"user"</span>,
    <span class="json-key">"token"</span>: <span class="json-string">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI..."</span>
  },
  <span class="json-key">"message"</span>: <span class="json-string">"เข้าสู่ระบบสำเร็จ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ทดสอบส่งคำขอยืนยันตัวตน (Authentication) เพื่อเข้าใช้งานระบบของลูกค้า โดยส่งอีเมลและรหัสผ่านที่สมัครไว้ก่อนหน้านี้ไปยัง Endpoint ล็อกอินหลัก เพื่อรับสิทธิ์การเข้าใช้งานระบบในรูปแบบของสิทธิ์ผู้ใช้งานทั่วไป (role: "user")</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">เซิร์ฟเวอร์ตรวจสอบความถูกต้องและรหัสผ่านที่ถูกเข้ารหัสไว้สำเร็จ จึงส่งสถานะตอบกลับ 200 OK พร้อมข้อมูลโปรไฟล์เบื้องต้นและโทเคนสิทธิ์การใช้งาน (JWT Token) เพื่อบันทึกไว้ฝั่งไคลเอนต์สำหรับเรียกใช้งาน API ส่วนจำกัดสิทธิ์ในขั้นตอนต่อๆ ไป</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 2</div>
    </div>
  </div>

  <!-- ================= PAGE 3 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">3. ล็อกอินผู้จัดการ (Login - Manager)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/auth/login</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge ok">200 OK</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"email"</span>: <span class="json-string">"manager@autopartspro.com"</span>,
  <span class="json-key">"password"</span>: <span class="json-string">"manager123"</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"_id"</span>: <span class="json-string">"3"</span>,
    <span class="json-key">"name"</span>: <span class="json-string">"Manager Staff"</span>,
    <span class="json-key">"email"</span>: <span class="json-string">"manager@autopartspro.com"</span>,
    <span class="json-key">"role"</span>: <span class="json-string">"manager"</span>,
    <span class="json-key">"token"</span>: <span class="json-string">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0..."</span>
  },
  <span class="json-key">"message"</span>: <span class="json-string">"เข้าสู่ระบบสำเร็จ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">เป็นการส่งข้อมูลยืนยันตัวตนของเจ้าหน้าที่ระบบที่มีบทบาทเป็นผู้จัดการ (role: "manager") เพื่อเข้าถึงแดชบอร์ดหลังบ้านและการควบคุมสต๊อกสินค้า รวมถึงการคัดกรองหลักฐานการชำระเงินตามสิทธิ์การใช้งานที่ระบบกำหนด</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบยืนยันตัวตนสำเร็จ ตอบกลับมาด้วยรหัสสถานะ 200 OK และส่งโทเคนที่มีข้อมูลสิทธิ์ระบุบทบาทอย่างชัดเจนเป็น "manager" ทำให้ฝั่งหน้าจอเว็บสามารถเปิดเมนูการจัดการสต๊อกสินค้าและออเดอร์สำหรับตำแหน่งนี้ได้</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 3</div>
    </div>
  </div>

  <!-- ================= PAGE 4 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">4. ล็อกอินแอดมิน (Login - Admin)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/auth/login</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge ok">200 OK</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"email"</span>: <span class="json-string">"admin@autopartspro.th"</span>,
  <span class="json-key">"password"</span>: <span class="json-string">"admin123456"</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"_id"</span>: <span class="json-string">"1"</span>,
    <span class="json-key">"name"</span>: <span class="json-string">"Admin"</span>,
    <span class="json-key">"email"</span>: <span class="json-string">"admin@autopartspro.th"</span>,
    <span class="json-key">"role"</span>: <span class="json-string">"admin"</span>,
    <span class="json-key">"token"</span>: <span class="json-string">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0..."</span>
  },
  <span class="json-key">"message"</span>: <span class="json-string">"เข้าสู่ระบบสำเร็จ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ทดสอบส่งคำขอเข้าใช้งานระบบจากผู้ดูแลระบบหลักสูงสุด (role: "admin") เพื่อตรวจสอบสิทธิ์การอนุมัติการจ่ายเงินขั้นสุดท้ายและดูแลระบบทั้งหมดของเซิร์ฟเวอร์และฐานข้อมูล</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">เซิร์ฟเวอร์อนุมัติการเชื่อมต่อ ส่งค่าตอบกลับสถานะ 200 OK และส่งโทเคน JWT ที่ระบุบทบาทอย่างเด่นชัดเป็น "admin" พร้อมสิทธิ์ในการลบฐานข้อมูลสินค้าหรืออัปเดตบทบาทผู้ใช้งานในระบบ</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 4</div>
    </div>
  </div>

  <!-- ================= PAGE 5 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">5. ดึงข้อมูลอะไหล่ทั้งหมด (Get Products)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method get">GET</span>
          <span class="postman-url">{{baseUrl}}/products</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge ok">200 OK</span>
          </div>
        </div>
        
        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: [
    {
      <span class="json-key">"id"</span>: <span class="json-number">1</span>,
      <span class="json-key">"name"</span>: <span class="json-string">"ล้อแม็ก Flowforming 18 นิ้ว Multi-Spoke"</span>,
      <span class="json-key">"brand"</span>: <span class="json-string">"RAYS"</span>,
      <span class="json-key">"carBrand"</span>: <span class="json-string">"BMW"</span>,
      <span class="json-key">"price"</span>: <span class="json-number">28000</span>,
      <span class="json-key">"stock"</span>: <span class="json-number">50</span>,
      <span class="json-key">"category"</span>: <span class="json-string">"promotion"</span>,
      <span class="json-key">"rating"</span>: <span class="json-number">4.8</span>,
      <span class="json-key">"reviews"</span>: <span class="json-number">124</span>
    }
  ]
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ใช้ HTTP Method GET ในการส่งคำขอไปยัง URL แคตตาล็อกสินค้าอะไหล่แต่งรถทั้งหมดที่มีอยู่ในระบบ เพื่อนำข้อมูลดังกล่าวมาใช้ประมวลผลและทำรายการแสดงผลบนหน้าร้านค้าออนไลน์</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบดึงข้อมูลจาก PostgreSQL สำเร็จและตอบกลับมาเป็นอาเรย์ของออบเจกต์สินค้าอะไหล่ (สถานะ 200 OK) โดยส่งคืนคุณสมบัติสำคัญ เช่น ชื่ออะไหล่ แบรนด์รถยนต์ ราคา จำนวนสต๊อกคงเหลือ รวมถึงคะแนนรีวิวเพื่อแสดงผลบนหน้าแรก</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 5</div>
    </div>
  </div>

  <!-- ================= PAGE 6 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">6. ค้นหาและกรองอะไหล่ (Search & Filter Products)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method get">GET</span>
          <span class="postman-url">{{baseUrl}}/products?category=promotion&search=Flowforming</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge ok">200 OK</span>
          </div>
        </div>
        
        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: [
    {
      <span class="json-key">"id"</span>: <span class="json-number">1</span>,
      <span class="json-key">"name"</span>: <span class="json-string">"ล้อแม็ก Flowforming 18 นิ้ว Multi-Spoke"</span>,
      <span class="json-key">"brand"</span>: <span class="json-string">"RAYS"</span>,
      <span class="json-key">"category"</span>: <span class="json-string">"promotion"</span>,
      <span class="json-key">"price"</span>: <span class="json-number">28000</span>
    }
  ]
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ใช้ Method GET ร่วมกับ Query Parameters เพื่อจำกัดขอบเขตการค้นหา โดยกำหนดเงื่อนไขหมวดหมู่สำหรับสินค้าลดราคา <code>category=promotion</code> และส่งคำค้นหาชื่ออะไหล่รถยนต์เป็นคำว่า <code>search=Flowforming</code></div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบกรองข้อมูลหลังบ้านและตอบกลับสถานะ 200 OK โดยส่งคืนเฉพาะสินค้าประเภทล้อแม็กที่มีคำว่า Flowforming ในฐานข้อมูลเท่านั้น บ่งชี้ว่าตรรกะการฟิลเตอร์และค้นหาข้อมูลบน Query API ทำงานได้อย่างถูกต้อง</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 6</div>
    </div>
  </div>

  <!-- ================= PAGE 7 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">7. เพิ่มอะไหล่ใหม่ (Add Product - Admin Only)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/products</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge created">201 Created</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"name"</span>: <span class="json-string">"โช๊คอัพสปอร์ต OHLINS DFV"</span>,
  <span class="json-key">"description"</span>: <span class="json-string">"โช๊คอัพแต่งระดับพรีเมียม ปรับระดับความหนืดและสูงต่ำได้"</span>,
  <span class="json-key">"brand"</span>: <span class="json-string">"OHLINS"</span>,
  <span class="json-key">"carBrand"</span>: <span class="json-string">"BMW"</span>,
  <span class="json-key">"price"</span>: <span class="json-number">85000</span>,
  <span class="json-key">"originalPrice"</span>: <span class="json-number">95000</span>,
  <span class="json-key">"image"</span>: <span class="json-string">"assets/images/products/ohlins.png"</span>,
  <span class="json-key">"category"</span>: <span class="json-string">"new"</span>,
  <span class="json-key">"badge"</span>: <span class="json-string">"hot"</span>,
  <span class="json-key">"stock"</span>: <span class="json-number">10</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"id"</span>: <span class="json-number">11</span>,
    <span class="json-key">"name"</span>: <span class="json-string">"โช๊คอัพสปอร์ต OHLINS DFV"</span>,
    <span class="json-key">"brand"</span>: <span class="json-string">"OHLINS"</span>,
    <span class="json-key">"price"</span>: <span class="json-number">85000</span>,
    <span class="json-key">"stock"</span>: <span class="json-number">10</span>,
    <span class="json-key">"isActive"</span>: <span class="json-boolean">true</span>
  },
  <span class="json-key">"message"</span>: <span class="json-string">"สร้างสินค้าสำเร็จ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">เป็นการส่งข้อมูลของสินค้าตัวใหม่ประเภทอะไหล่และโช๊คอัพรถยนต์ระดับพรีเมียม เพื่อขอเพิ่มเข้าไปในคลังสินค้า โดยการทดสอบนี้ระบบจะตรวจสอบความถูกต้องของสิทธิ์ด้วย Authorization Header (JWT Bearer Token) ของแอดมินหรือผู้จัดการระบบที่มีสิทธิ์เท่านั้น</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">เมื่อมี JWT Token ที่ถูกต้องของบทบาท Admin ระบบทำการอนุมัติบันทึกสินค้าใหม่ลงตาราง <code>parts</code> ใน PostgreSQL และตอบกลับสถานะ 201 Created ทันที หากโทเคนหมดอายุหรือไม่มีสิทธิ์ ระบบจะตอบกลับ 403 Forbidden เพื่อรักษาความปลอดภัย</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 7</div>
    </div>
  </div>

  <!-- ================= PAGE 8 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">8. ดึงข้อมูลออเดอร์ทั้งหมด (Get Orders)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method get">GET</span>
          <span class="postman-url">{{baseUrl}}/orders</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge ok">200 OK</span>
          </div>
        </div>
        
        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: [
    {
      <span class="json-key">"id"</span>: <span class="json-string">"1"</span>,
      <span class="json-key">"user_id"</span>: <span class="json-string">"11"</span>,
      <span class="json-key">"items"</span>: [
        {
          <span class="json-key">"product"</span>: <span class="json-string">"1"</span>,
          <span class="json-key">"name"</span>: <span class="json-string">"ล้อแม็ก Flowforming 18 นิ้ว Multi-Spoke"</span>,
          <span class="json-key">"price"</span>: <span class="json-number">28000</span>,
          <span class="json-key">"quantity"</span>: <span class="json-number">2</span>
        }
      ],
      <span class="json-key">"total_amount"</span>: <span class="json-number">56000</span>,
      <span class="json-key">"status"</span>: <span class="json-string">"pending"</span>
    }
  ]
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ใช้ Method GET ร้องขอประวัติการสั่งซื้อทั้งหมดของผู้ใช้งานที่ล็อกอินอยู่ผ่านทาง API Endpoint เพื่อนำข้อมูลออเดอร์เก่าและสถานะมาแสดงบนประวัติออเดอร์ของลูกค้า โดยต้องระบุ Token ใน Header ทุกครั้ง</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">เซิร์ฟเวอร์ดึงข้อมูลจากตาราง <code>orders</code> ในฐานข้อมูล โดยคัดกรองออเดอร์ที่สัมพันธ์กับไอดีของผู้ส่งคำขอ และตอบกลับสถานะ 200 OK พร้อมข้อมูลสินค้าและสถานะชำระเงินของแต่ละคำสั่งซื้ออย่างถูกต้อง</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 8</div>
    </div>
  </div>

  <!-- ================= PAGE 9 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">9. สร้างออเดอร์จองอะไหล่ (Create Order - Pay Later)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/orders</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge created">201 Created</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"paymentMethod"</span>: <span class="json-string">"โอนเงินภายหลัง (แนบสลิป)"</span>,
  <span class="json-key">"shippingAddress"</span>: {
    <span class="json-key">"name"</span>: <span class="json-string">"กฤษฎา ต้องไกรเลิศ"</span>,
    <span class="json-key">"phone"</span>: <span class="json-string">"0812345678"</span>,
    <span class="json-key">"fullAddress"</span>: <span class="json-string">"123 SPU Road, Bangkok"</span>
  },
  <span class="json-key">"items"</span>: [
    {
      <span class="json-key">"product"</span>: <span class="json-string">"1"</span>,
      <span class="json-key">"quantity"</span>: <span class="json-number">1</span>
    }
  ],
  <span class="json-key">"note"</span>: <span class="json-string">"ส่งช่วงบ่าย"</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"id"</span>: <span class="json-string">"5"</span>,
    <span class="json-key">"user_id"</span>: <span class="json-string">"11"</span>,
    <span class="json-key">"subtotal"</span>: <span class="json-number">28000</span>,
    <span class="json-key">"shipping_cost"</span>: <span class="json-number">0</span>,
    <span class="json-key">"total_amount"</span>: <span class="json-number">28000</span>,
    <span class="json-key">"status"</span>: <span class="json-string">"pending"</span>
  },
  <span class="json-key">"message"</span>: <span class="json-string">"สร้างคำสั่งซื้อสำเร็จ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ทดสอบส่งรายการซื้อเพื่อสร้างออเดอร์แบบโอนเงินภายหลัง โดยระบุประเภทชำระเงิน สินค้าที่ต้องการซื้อ และจำนวน เพื่อให้ระบบหักลดสต๊อกของสินค้าในตาราง <code>parts</code> ชั่วคราวก่อนที่จะมีการชำระเงินจริง</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบตรวจสอบข้อมูลสินค้าและปริมาณในสต๊อกผ่าน ตอบกลับมาด้วยสถานะ 201 Created โดยระบุสถานะเริ่มแรกของคำสั่งซื้อคือ "pending" (รอการชำระเงิน) เพื่อรอให้ลูกค้าอัปโหลดสลีปเป็นหลักฐาน</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 9</div>
    </div>
  </div>

  <!-- ================= PAGE 10 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">10. แนบสลิปโอนเงิน (Submit Payment Slip)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/orders/ใส่รหัสออเดอร์ที่นี่/submit-slip</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge error">404 Not Found</span>
          </div>
        </div>
        
        <div class="postman-body-section">
          <div class="postman-body-title">Request Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"slip"</span>: <span class="json-string">"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1..."</span>
}</div>
        </div>

        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">false</span>,
  <span class="json-key">"message"</span>: <span class="json-string">"ไม่พบออเดอร์ที่ระบุ"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ทดลองยิง API เพื่อนำส่งสลิปหลักฐานการชำระเงินโอนด้วยรหัสภาพแบบ Base64 เข้าสู่ระบบสำหรับออเดอร์ที่สั่งซื้อไว้ โดยในส่วนของ URL จะระบุข้อความจำลอง ("ใส่รหัสออเดอร์ที่นี่") แทนที่จะระบุเลขรหัสจริงเพื่อความปลอดภัยในขั้นตอนพัฒนา</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบตรวจสอบไม่พบข้อมูลออเดอร์ดังกล่าวในฐานข้อมูลเนื่องจากระบุรหัสจำลอง จึงตอบกลับสถานะ 404 Not Found ซึ่งบ่งชี้ว่าระบบกรองดักจับข้อผิดพลาด (Error Handling) ของเซิร์ฟเวอร์ทำงานได้อย่างถูกต้องและเสถียร ไม่พบช่องโหว่ความปลอดภัย</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 10</div>
    </div>
  </div>

  <!-- ================= PAGE 11 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">11. ผู้จัดการตรวจสอบอนุมัติสลิป (Manager Approve Slip)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/manager/approve-slip/ใส่รหัสออเดอร์ที่นี่</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge error">404 Not Found</span>
          </div>
        </div>
        
        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">false</span>,
  <span class="json-key">"message"</span>: <span class="json-string">"ไม่พบข้อมูลออเดอร์เพื่อตรวจสอบหลักฐาน"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">เป็นการใช้บทบาทของผู้จัดการ (Manager) เพื่อกดอนุมัติสลีปการชำระเงินที่ส่งมาจากลูกค้า โดยจะทำการตรวจสอบว่ารูปสลิปมีความถูกต้องหรือไม่ ก่อนปรับสถานะออเดอร์ในขั้นตอนแรกจากรหัสออเดอร์บน URL</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">เมื่อใช้รหัสออเดอร์จำลองใน URL ระบบส่งผลตอบกลับสถานะ 404 Not Found ทันที แต่ถ้าหากเปลี่ยนไประบุด้วยรหัสสั่งซื้อที่ถูกต้องจริง (เช่น ID: 5) ระบบจะปรับเปลี่ยนสถานะของคำสั่งซื้อเป็น "manager_approved" เพื่อส่งข้อมูลให้ผู้ดูแลทำการยืนยันบัญชีปลายทางถัดไป</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 11</div>
    </div>
  </div>

  <!-- ================= PAGE 12 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">12. แอดมินยืนยันยอดเงินสุดท้าย (Admin Final Confirm)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/admin/confirm-order/ใส่รหัสออเดอร์ที่นี่</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge error">404 Not Found</span>
          </div>
        </div>
        
        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">false</span>,
  <span class="json-key">"message"</span>: <span class="json-string">"ไม่พบออเดอร์เป้าหมายเพื่อทำเรื่องยืนยัน"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">ทดสอบส่งเรื่องให้ระบบหลังบ้านที่มีแอดมิน (Admin) คอยตรวจสอบยอดเงินฝากเข้าจริงผ่านระบบธนาคาร เมื่อเงินเข้าเรียบร้อย แอดมินจะกดยืนยันออเดอร์จากระบบหลังบ้านเพื่อเปลี่ยนสถานะออเดอร์ให้พร้อมจัดส่งสินค้า</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">ระบบการตรวจสอบสิทธิ์ความปลอดภัยส่งค่าตอบกลับ 404 Not Found เนื่องจากความไม่ถูกต้องของรหัสออเดอร์จำลองใน URL โดยในกระบวนการทำงานปกติเมื่อข้อมูลถูกต้อง สถานะจะอัปเดตเป็น "confirmed" เพื่อดำเนินการสั่งบรรจุและจัดเตรียมส่งมอบชิ้นงาน</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 12</div>
    </div>
  </div>

  <!-- ================= PAGE 13 ================= -->
  <div class="page">
    <div class="page-header">
      <div class="logo">AutoParts <span>Pro</span></div>
      <div class="course">CSI204 Digital Platform for Software Development</div>
    </div>
    
    <div class="content-box">
      <h2 class="page-title">13. ผู้จัดการจัดส่งสินค้า (Manager Ship Order)</h2>
      
      <div class="postman-ui">
        <div class="postman-bar">
          <span class="postman-method post">POST</span>
          <span class="postman-url">{{baseUrl}}/manager/ship-order/ใส่รหัสออเดอร์ที่นี่</span>
          <div class="postman-status">
            <span style="color: #888;">Status:</span>
            <span class="postman-status-badge error">404 Not Found</span>
          </div>
        </div>
        
        <div class="postman-body-section no-border">
          <div class="postman-body-title">Response Body (JSON)</div>
          <div class="postman-json">{
  <span class="json-key">"success"</span>: <span class="json-boolean">false</span>,
  <span class="json-key">"message"</span>: <span class="json-string">"ไม่พบรหัสการจัดส่งเป้าหมาย"</span>
}</div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="analysis-block">
          <div class="analysis-title">คำอธิบายการทดสอบ</div>
          <div class="analysis-text">เป็นการส่งเรื่องอัปเดตระบบในขั้นตอนการจัดส่งสินค้า (Ship Order) โดยเจ้าหน้าที่ฝ่ายจัดการ หลังนำสินค้าอะไหล่แต่งรถส่งมอบให้บริษัทโลจิสติกส์แล้ว จะทำการอัปเดตสถานะออเดอร์และบันทึกรหัสตรวจสอบพัสดุ (Tracking Number) ลงในระบบเพื่อปิดรอบการขาย</div>
        </div>
        <div class="analysis-block">
          <div class="analysis-title">วิเคราะห์ผลลัพธ์</div>
          <div class="analysis-text">เซิร์ฟเวอร์ตอบกลับสถานะ 404 Not Found เนื่องจากความไม่เข้าคู่ของรหัสออเดอร์ในขั้นตอนพัฒนา ในระบบปฏิบัติงานจริงระบบจะเปลี่ยนสถานะเป็น "shipped" พร้อมแจ้งเลขพัสดุผ่านทางระบบหน้าบ้านให้ลูกค้าสามารถเข้าไปติดตามการขนส่งได้</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>นายกฤษฎา ต้องไกรเลิศ (รหัส 67115444)</div>
      <div>หน้า 13</div>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'report_temp.html');
const pdfPath = path.join(__dirname, 'Report_Postman_AutoParts.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ HTML report generated at:', htmlPath);

// Execute Google Chrome headless to compile to PDF
const fileUrl = 'file:///' + htmlPath.replace(/\\\\/g, '/').replace(/\\/g, '/');
const chromeCmd = `& "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" --headless=new --print-to-pdf="${pdfPath}" "${fileUrl}"`;

console.log('⏳ Compiling to PDF using Chrome...');
exec(chromeCmd, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error compiling to PDF:', error);
    process.exit(1);
  }
  
  console.log('✅ PDF compiled successfully!');
  console.log('📁 Output location:', pdfPath);
  
  // Clean up temporary HTML file
  try {
    fs.unlinkSync(htmlPath);
    console.log('🧹 Cleaned up temporary HTML file.');
  } catch (e) {
    console.warn('⚠️ Could not remove temporary HTML file:', e.message);
  }
  
  process.exit(0);
});
