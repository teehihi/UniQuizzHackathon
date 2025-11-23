# ✅ EMAIL VERIFICATION - HOÀN THÀNH

## 🎯 Đã Implement (Backend)

### **Files Created:**
1. `server/models/EmailVerification.js` - Model lưu OTP
2. `server/services/emailService.js` - Service gửi email
3. `server/routes/emailRoutes.js` - API routes
4. `server/.env` - Thêm EMAIL config

### **API Endpoints:**
- `POST /api/email/send-otp` - Gửi mã OTP
- `POST /api/email/verify-otp` - Xác thực OTP
- `POST /api/email/resend-otp` - Gửi lại OTP

### **Features:**
- ✅ OTP 6 số
- ✅ Hết hạn sau 10 phút
- ✅ Rate limiting (3 lần/10 phút)
- ✅ Max 5 lần nhập sai
- ✅ Email template đẹp
- ✅ Welcome email

---

## 🔧 SETUP NGAY (QUAN TRỌNG!)

### **Bước 1: Tạo Gmail App Password**
1. Vào https://myaccount.google.com/apppasswords
2. Tạo App Password cho "UniQuizz"
3. Copy mật khẩu 16 ký tự

### **Bước 2: Cập nhật .env**
Mở `server/.env` và sửa:
\`\`\`
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
\`\`\`

### **Bước 3: Restart Server**
\`\`\`bash
cd server
npm run dev
\`\`\`

---

## 📱 CÁCH SỬ DỤNG

### **Flow:**
\`\`\`
1. User nhập email → Click "Gửi mã"
2. Backend gửi OTP qua email
3. User nhập OTP → Click "Xác thực"
4. Nếu đúng → Cho phép đăng ký
\`\`\`

### **Test API:**
\`\`\`bash
# Gửi OTP
curl -X POST http://localhost:5001/api/email/send-otp \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@gmail.com","fullName":"Test"}'

# Xác thực OTP (check email để lấy mã)
curl -X POST http://localhost:5001/api/email/verify-otp \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@gmail.com","otp":"123456"}'
\`\`\`

---

## 🎨 Email Template

Email gửi đi có:
- Logo UniQuizz
- Mã OTP to, rõ ràng
- Countdown 10 phút
- Cảnh báo bảo mật
- Button xác thực
- Footer đẹp

---

## 🚀 NEXT: Frontend

Cần tạo:
1. `VerifyEmail.jsx` - Trang nhập OTP
2. Update `Register.jsx` - Thêm bước xác thực
3. OTP input component
4. Countdown timer
5. Resend button

---

## 📞 Hỗ Trợ

Chi tiết đầy đủ: `EMAIL_SETUP_GUIDE.md`

**Backend đã sẵn sàng!** Chỉ cần setup Gmail và test thôi! 🎉
