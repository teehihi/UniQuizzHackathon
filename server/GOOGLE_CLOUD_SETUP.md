# 🔐 Hướng dẫn Setup Google Cloud Text-to-Speech

## ✅ Code đã sẵn sàng!

Tất cả code đã được implement. Bây giờ chỉ cần setup credentials để kích hoạt Google Cloud TTS.

---

## 📋 BƯỚC 1: Tạo Google Cloud Project

1. **Truy cập Google Cloud Console**:
   - Vào: https://console.cloud.google.com
   - Đăng nhập với Google Account

2. **Tạo Project mới**:
   - Click "Select a project" → "New Project"
   - Tên project: `uniquizz-tts` (hoặc tên bạn thích)
   - Click "Create"

3. **Enable Text-to-Speech API**:
   - Vào menu → "APIs & Services" → "Library"
   - Tìm "Cloud Text-to-Speech API"
   - Click "Enable"

---

## 📋 BƯỚC 2: Tạo Service Account

1. **Vào IAM & Admin**:
   - Menu → "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"

2. **Điền thông tin**:
   - Service account name: `uniquizz-tts-service`
   - Service account ID: `uniquizz-tts-service` (tự động)
   - Click "Create and Continue"

3. **Gán quyền**:
   - Role: Chọn "Cloud Text-to-Speech User"
   - Click "Continue" → "Done"

4. **Tạo Key**:
   - Click vào service account vừa tạo
   - Tab "Keys" → "Add Key" → "Create new key"
   - Key type: **JSON**
   - Click "Create"
   - File JSON sẽ tự động download

---

## 📋 BƯỚC 3: Cài đặt Credentials

1. **Đổi tên file**:
   ```bash
   # File download có tên dạng: uniquizz-tts-xxxxx.json
   # Đổi tên thành:
   google-tts-credentials.json
   ```

2. **Copy vào server**:
   ```bash
   # Tạo folder config nếu chưa có
   mkdir -p server/config
   
   # Copy file vào
   cp ~/Downloads/google-tts-credentials.json server/config/
   ```

3. **Kiểm tra file**:
   ```bash
   ls -la server/config/google-tts-credentials.json
   ```

4. **Set environment variable** (Optional):
   ```bash
   # server/.env
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-tts-credentials.json
   ```

---

## 📋 BƯỚC 4: Test

1. **Restart server**:
   ```bash
   cd server
   npm start
   ```

2. **Kiểm tra log**:
   ```
   ✅ Google Cloud TTS initialized successfully
   ```

3. **Test API**:
   ```bash
   curl http://localhost:5000/api/mentor/tts/status \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   Response:
   ```json
   {
     "googleCloudTTS": true,
     "fallbackTTS": true,
     "message": "Google Cloud TTS is available"
   }
   ```

4. **Test giọng đọc**:
   - Vào trang Mentor
   - Upload file
   - Mở Voice Settings
   - Sẽ thấy: "🌟 Google Cloud TTS (WaveNet)"
   - Chọn giọng WaveNet
   - Click "Bắt đầu giảng"
   - Nghe giọng đọc tự nhiên!

---

## 💰 CHI PHÍ

### Free Tier (Miễn phí):
- **1 triệu ký tự WaveNet/tháng**
- **4 triệu ký tự Standard/tháng**

### Ước tính sử dụng:
- 1 bài giảng ~5000 ký tự
- 200 bài giảng/tháng = 1 triệu ký tự
- **→ HOÀN TOÀN MIỄN PHÍ!**

### Sau khi hết free tier:
- WaveNet: $16 / 1 triệu ký tự
- Standard: $4 / 1 triệu ký tự

---

## 🔒 BẢO MẬT

### ⚠️ QUAN TRỌNG:

1. **KHÔNG commit credentials vào Git**:
   ```bash
   # Thêm vào .gitignore
   echo "server/config/google-tts-credentials.json" >> .gitignore
   ```

2. **Giữ file credentials an toàn**:
   - Không share file này
   - Không upload lên public repository
   - Backup ở nơi an toàn

3. **Rotate keys định kỳ**:
   - Mỗi 90 ngày nên tạo key mới
   - Xóa key cũ

---

## 🚨 TROUBLESHOOTING

### Lỗi: "Google Cloud TTS not initialized"

**Nguyên nhân**: Không tìm thấy credentials file

**Giải pháp**:
1. Kiểm tra file tồn tại:
   ```bash
   ls server/config/google-tts-credentials.json
   ```

2. Kiểm tra quyền đọc:
   ```bash
   chmod 600 server/config/google-tts-credentials.json
   ```

3. Kiểm tra format JSON:
   ```bash
   cat server/config/google-tts-credentials.json | jq .
   ```

### Lỗi: "API not enabled"

**Giải pháp**:
1. Vào Google Cloud Console
2. Enable "Cloud Text-to-Speech API"
3. Đợi 1-2 phút
4. Restart server

### Lỗi: "Permission denied"

**Giải pháp**:
1. Kiểm tra Service Account có role "Cloud Text-to-Speech User"
2. Tạo lại key nếu cần

---

## ✅ CHECKLIST

- [ ] Tạo Google Cloud Project
- [ ] Enable Text-to-Speech API
- [ ] Tạo Service Account
- [ ] Gán role "Cloud Text-to-Speech User"
- [ ] Download credentials JSON
- [ ] Copy vào `server/config/google-tts-credentials.json`
- [ ] Thêm vào `.gitignore`
- [ ] Restart server
- [ ] Kiểm tra log "✅ Google Cloud TTS initialized"
- [ ] Test API `/mentor/tts/status`
- [ ] Test giọng đọc trên web

---

## 🎉 KẾT QUẢ

Sau khi hoàn thành:
- ✅ Giọng đọc WaveNet siêu tự nhiên
- ✅ Có cảm xúc, ngữ điệu
- ✅ Chọn được giọng nam/nữ cụ thể
- ✅ Điều chỉnh pitch, rate, volume
- ✅ Fallback tự động nếu có lỗi
- ✅ Hoàn toàn miễn phí (trong free tier)

**Miku Mentor giờ đây có giọng đọc chuyên nghiệp như giáo viên thật!** 🎤✨

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra log server
2. Test API endpoint
3. Xem file `GOOGLE_TTS_UPGRADE.md` để biết thêm chi tiết
