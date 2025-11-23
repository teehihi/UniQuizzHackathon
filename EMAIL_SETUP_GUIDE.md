# 📧 HƯỚNG DẪN CÀI ĐẶT EMAIL XÁC THỰC

## ✅ Đã Implement

### **Tính năng:**
1. ✅ Gửi mã OTP (6 số) qua email
2. ✅ Xác thực OTP
3. ✅ Gửi lại OTP
4. ✅ Rate limiting (3 lần/10 phút)
5. ✅ OTP tự động hết hạn sau 10 phút
6. ✅ Email template đẹp mắt
7. ✅ Welcome email sau khi xác thực

---

## 🔧 Setup Gmail SMTP

### **Bước 1: Tạo App Password**

1. **Đăng nhập Gmail** của bạn
2. **Vào Google Account Settings**: https://myaccount.google.com/
3. **Security** → **2-Step Verification** (Bật nếu chưa có)
4. **App passwords**: https://myaccount.google.com/apppasswords
5. **Select app**: Mail
6. **Select device**: Other (Custom name) → Nhập "UniQuizz"
7. **Generate** → Copy mật khẩu 16 ký tự

### **Bước 2: Cấu hình .env**

Mở file `server/.env` và thêm:

\`\`\`bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password (16 ký tự)
CLIENT_URL=http://localhost:5173
\`\`\`

**Ví dụ:**
\`\`\`bash
EMAIL_USER=teeforwork21@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
CLIENT_URL=http://localhost:5173
\`\`\`

### **Bước 3: Restart Server**

\`\`\`bash
cd server
npm run dev
\`\`\`

---

## 📱 API Endpoints

### **1. Gửi OTP**
\`\`\`http
POST /api/email/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến email của bạn",
  "expiresIn": 600
}
\`\`\`

### **2. Xác thực OTP**
\`\`\`http
POST /api/email/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Xác thực email thành công",
  "verified": true
}
\`\`\`

### **3. Gửi lại OTP**
\`\`\`http
POST /api/email/resend-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A"
}
\`\`\`

---

## 🎨 Email Template

Email gửi đi sẽ có:
- ✅ Logo UniQuizz
- ✅ Mã OTP 6 số to, rõ ràng
- ✅ Thời gian hết hạn (10 phút)
- ✅ Cảnh báo bảo mật
- ✅ Button "Xác thực ngay"
- ✅ Footer với thông tin liên hệ
- ✅ Responsive design

---

## 🔒 Bảo Mật

### **Rate Limiting:**
- Tối đa 3 lần gửi OTP trong 10 phút
- Tối đa 5 lần nhập sai OTP

### **OTP Expiry:**
- OTP tự động xóa sau 10 phút
- MongoDB TTL index tự động cleanup

### **Validation:**
- Email format validation
- OTP format validation (6 số)
- Kiểm tra email đã tồn tại

---

## 🧪 Testing

### **Test gửi OTP:**
\`\`\`bash
curl -X POST http://localhost:5001/api/email/send-otp \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@gmail.com","fullName":"Test User"}'
\`\`\`

### **Test xác thực OTP:**
\`\`\`bash
curl -X POST http://localhost:5001/api/email/verify-otp \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@gmail.com","otp":"123456"}'
\`\`\`

---

## 🐛 Troubleshooting

### **Lỗi: "Invalid login"**
- ✅ Kiểm tra EMAIL_USER đúng format
- ✅ Kiểm tra EMAIL_PASSWORD là App Password (không phải mật khẩu thường)
- ✅ Bật 2-Step Verification

### **Lỗi: "Connection timeout"**
- ✅ Kiểm tra internet connection
- ✅ Kiểm tra firewall không block port 587
- ✅ Thử dùng port 465 (SSL)

### **Email không nhận được:**
- ✅ Kiểm tra Spam folder
- ✅ Kiểm tra email address đúng
- ✅ Kiểm tra server logs

### **OTP hết hạn:**
- ✅ OTP chỉ có hiệu lực 10 phút
- ✅ Gửi lại OTP mới

---

## 📊 Database Schema

### **EmailVerification Collection:**
\`\`\`javascript
{
  email: String,
  otp: String,
  createdAt: Date,  // Auto-delete after 10 minutes
  attempts: Number  // Max 5 attempts
}
\`\`\`

### **User Collection (Updated):**
\`\`\`javascript
{
  email: String,
  password: String,
  fullName: String,
  isEmailVerified: Boolean,  // NEW
  verifiedAt: Date,          // NEW
  createdAt: Date
}
\`\`\`

---

## 🚀 Next Steps

### **Frontend Integration:**
1. Tạo trang VerifyEmail.jsx
2. Form nhập OTP
3. Countdown timer (10 phút)
4. Resend OTP button
5. Success/Error messages

### **Flow:**
\`\`\`
1. User nhập email + password → Click "Đăng ký"
2. Frontend gọi /api/email/send-otp
3. Hiển thị form nhập OTP
4. User nhập OTP → Frontend gọi /api/email/verify-otp
5. Nếu success → Gọi /api/auth/register
6. Redirect to Login
\`\`\`

---

## 💡 Tips

### **Production:**
- Sử dụng SendGrid hoặc AWS SES cho scale
- Setup SPF, DKIM, DMARC records
- Monitor email delivery rate
- Setup email templates trong database

### **Alternative Services:**
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: $0.10/1000 emails
- **Resend**: Modern email API

---

## 📞 Support

Nếu gặp vấn đề:
1. Check server logs
2. Test với Postman/curl
3. Verify Gmail settings
4. Contact: teeforwork21@gmail.com

**Happy Coding!** 📧✨
