# 📧 SMTP OPTIONS - HƯỚNG DẪN

## ✅ Đã Update

Hệ thống giờ hỗ trợ **nhiều SMTP providers**:
1. Gmail SMTP (Default)
2. Custom SMTP Server
3. Outlook/Hotmail
4. Yahoo Mail
5. SendGrid
6. Mailgun
7. AWS SES

---

## 🔧 SETUP OPTIONS

### **Option 1: Gmail SMTP (Recommended)**

**Ưu điểm:**
- ✅ Miễn phí
- ✅ 500 emails/ngày
- ✅ Dễ setup
- ✅ Tin cậy cao

**Setup:**
\`\`\`bash
# server/.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVICE=gmail
\`\`\`

**Lấy App Password:**
1. https://myaccount.google.com/apppasswords
2. Tạo password cho "UniQuizz"
3. Copy 16 ký tự

---

### **Option 2: Outlook/Hotmail SMTP**

**Setup:**
\`\`\`bash
# server/.env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
\`\`\`

**Note:** Outlook không cần App Password

---

### **Option 3: Yahoo Mail SMTP**

**Setup:**
\`\`\`bash
# server/.env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
\`\`\`

**Lấy App Password:**
1. https://login.yahoo.com/account/security
2. Generate app password
3. Copy password

---

### **Option 4: Custom SMTP Server**

Nếu bạn có SMTP server riêng:

\`\`\`bash
# server/.env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
\`\`\`

**Common Ports:**
- `587` - TLS (Recommended)
- `465` - SSL
- `25` - Unencrypted (Not recommended)

---

### **Option 5: SendGrid (Professional)**

**Ưu điểm:**
- ✅ 100 emails/day free
- ✅ Professional
- ✅ Analytics
- ✅ High deliverability

**Setup:**
\`\`\`bash
# server/.env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
\`\`\`

**Lấy API Key:**
1. Đăng ký: https://sendgrid.com/
2. Settings → API Keys
3. Create API Key
4. Copy key

---

### **Option 6: Mailgun**

**Setup:**
\`\`\`bash
# server/.env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
\`\`\`

**Free tier:** 5,000 emails/month

---

### **Option 7: AWS SES**

**Setup:**
\`\`\`bash
# server/.env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
\`\`\`

**Cost:** $0.10 per 1,000 emails

---

## 🧪 TEST SMTP

### **Test Connection:**
\`\`\`bash
# Trong server folder
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((error, success) => {
  if (error) console.log('❌ Error:', error);
  else console.log('✅ SMTP Ready!');
});
"
\`\`\`

---

## 📊 So Sánh

| Provider | Free Limit | Setup | Deliverability | Recommended |
|----------|-----------|-------|----------------|-------------|
| Gmail | 500/day | Easy | High | ✅ Yes |
| Outlook | 300/day | Easy | Medium | ⚠️ OK |
| Yahoo | 500/day | Medium | Medium | ⚠️ OK |
| SendGrid | 100/day | Medium | Very High | ✅ Yes |
| Mailgun | 5000/month | Medium | High | ✅ Yes |
| AWS SES | Pay-as-go | Hard | Very High | 💰 Paid |

---

## 🎯 RECOMMENDATION

### **Cho Development:**
→ **Gmail SMTP** (Dễ nhất, miễn phí)

### **Cho Production:**
→ **SendGrid** hoặc **Mailgun** (Professional, analytics)

### **Cho Scale:**
→ **AWS SES** (Rẻ nhất khi gửi nhiều)

---

## 🔒 Security Tips

1. **Không commit .env vào Git**
2. **Dùng App Password, không dùng mật khẩu thật**
3. **Enable 2FA trên email account**
4. **Rotate passwords định kỳ**
5. **Monitor email sending logs**

---

## 🐛 Troubleshooting

### **Lỗi: "Invalid login"**
- Check username/password
- Check App Password (nếu Gmail/Yahoo)
- Check 2FA enabled

### **Lỗi: "Connection timeout"**
- Check SMTP_HOST đúng
- Check SMTP_PORT đúng
- Check firewall/antivirus

### **Lỗi: "Self-signed certificate"**
- Set \`SMTP_SECURE=false\`
- Add \`tls: { rejectUnauthorized: false }\`

### **Email vào Spam:**
- Setup SPF record
- Setup DKIM
- Setup DMARC
- Use professional email service

---

## 📝 Example Configs

### **Gmail:**
\`\`\`env
EMAIL_USER=myapp@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
SMTP_SERVICE=gmail
\`\`\`

### **Custom SMTP:**
\`\`\`env
SMTP_HOST=mail.mydomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@mydomain.com
SMTP_PASSWORD=mypassword123
\`\`\`

### **SendGrid:**
\`\`\`env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxx
\`\`\`

---

## ✅ Current Setup

Hệ thống hiện tại:
- ✅ Hỗ trợ Gmail SMTP
- ✅ Hỗ trợ Custom SMTP
- ✅ Auto-detect config
- ✅ Fallback to mock mode
- ✅ Error handling
- ✅ TLS/SSL support

**Chỉ cần update .env và restart server!**

---

## 🚀 Quick Start

1. **Chọn provider** (Gmail recommended)
2. **Update .env** với config tương ứng
3. **Restart server**: \`npm run dev\`
4. **Test**: Đăng ký với email thật
5. **Check email** → Nhận OTP
6. **Done!** 🎉

---

Bạn muốn dùng provider nào? Tôi có thể hướng dẫn chi tiết!
