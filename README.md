# NB Pay — ขั้นตอน Deploy

## สิ่งที่ต้องทำก่อน Deploy (ทำครั้งเดียว)

---

### STEP 1 — สร้าง Google Sheets

1. ไปที่ sheets.google.com → สร้าง Spreadsheet ใหม่
2. ตั้งชื่อ Sheet แรกว่า **"ข้อมูลพนักงาน"** (ดับเบิลคลิกที่แท็บล่าง)
3. แถวแรก (row 1) ใส่หัวคอลัมน์ดังนี้:

```
วันที่-เวลา | ชื่อ LINE | ประเภท | ชื่อ | ที่อยู่ | เลขภาษี | เบอร์โทร | อีเมล | ตำแหน่ง | หน้าที่ | สถานที่ | อัตราภาษี | มาตรา | ธนาคาร | ชื่อบัญชี | เลขบัญชี | หมายเหตุ | LINE User ID
```

4. Copy **Sheet ID** จาก URL:
   `https://docs.google.com/spreadsheets/d/**[SHEET_ID]**/edit`

---

### STEP 2 — สร้าง Google Service Account

1. ไปที่ console.cloud.google.com
2. สร้าง Project ใหม่ (หรือใช้อันเดิม)
3. เปิด **"Google Sheets API"** (ค้นหาใน API Library)
4. ไปที่ **IAM & Admin → Service Accounts → Create**
5. ตั้งชื่อ: `nbpay-sheets`
6. กด **"Create and Continue"** → Skip roles → Done
7. คลิกเข้า Service Account → แท็บ **"Keys"** → **"Add Key"** → **JSON**
8. ดาวน์โหลดไฟล์ JSON (จะได้ `client_email` และ `private_key`)

9. **แชร์ Google Sheets** ให้ Service Account:
   - เปิด Sheets → Share → ใส่ email จากไฟล์ JSON (`...@....iam.gserviceaccount.com`)
   - ให้สิทธิ์ **Editor**

---

### STEP 3 — Deploy บน Vercel

1. ไปที่ vercel.com → Sign up ด้วย GitHub
2. สร้าง GitHub repo ใหม่ชื่อ `nbpay` แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้
3. ใน Vercel → **Import Project** → เลือก repo `nbpay`
4. ก่อน Deploy กด **"Environment Variables"** แล้วใส่:

| Key | Value |
|-----|-------|
| `GOOGLE_SHEET_ID` | Sheet ID จาก Step 1 |
| `GOOGLE_CLIENT_EMAIL` | `client_email` จากไฟล์ JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` จากไฟล์ JSON (รวม -----BEGIN...) |

5. กด **Deploy** → รอสักครู่ → ได้ URL เช่น `nbpay.vercel.app`

---

### STEP 4 — อัปเดต LIFF Endpoint URL

1. กลับไปที่ developers.line.me
2. เข้า Channel → แท็บ **LIFF**
3. แก้ **Endpoint URL** จาก `https://example.com` เป็น URL จาก Vercel
4. กด **Update**

---

### STEP 5 — ทดสอบ

1. Copy **LIFF URL**: `https://liff.line.me/2010532430-ZedBwu4E`
2. เปิดใน LINE browser
3. กรอกข้อมูลแล้วกดส่ง
4. เช็ค Google Sheets ว่าข้อมูลขึ้นไหม ✅

---

### ส่งลิงก์ให้พนักงาน

ส่ง URL นี้ใน LINE Group หรือทำ QR Code:
```
https://liff.line.me/2010532430-ZedBwu4E
```

---

## ปัญหาที่พบบ่อย

**ข้อมูลไม่ขึ้น Sheets** → เช็คว่าแชร์ Sheets ให้ Service Account แล้ว

**หน้าเปิดไม่ได้ใน LINE** → เช็ค Endpoint URL ใน LIFF ว่าตรงกับ Vercel URL

**Error 500** → เช็ค Environment Variables ใน Vercel ว่าครบและถูกต้อง
