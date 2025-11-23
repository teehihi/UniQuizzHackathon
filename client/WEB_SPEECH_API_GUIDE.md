# 🎤 Web Speech API - Hướng dẫn sử dụng

## ✅ ĐÃ HOÀN THÀNH!

Web Speech API đã được tích hợp hoàn toàn vào UniQuizz Mentor!

---

## 🎯 TÍNH NĂNG

### **Web Speech API:**
- ✅ Hoàn toàn miễn phí
- ✅ Không cần API key
- ✅ Không cần billing
- ✅ Chạy trên browser (không cần server)
- ✅ Giọng đọc tự nhiên hơn Google Translate
- ✅ Hỗ trợ nhiều giọng
- ✅ Điều chỉnh pitch (0-2)
- ✅ Điều chỉnh rate (0.5-2.0)
- ✅ Điều chỉnh volume (0-1)

---

## 🚀 CÁCH SỬ DỤNG

### **Bước 1: Vào trang Mentor**
```
http://localhost:5173/mentor
```

### **Bước 2: Upload file**
- Click "Upload tài liệu"
- Chọn file .docx
- Đợi xử lý

### **Bước 3: Mở Voice Settings**
- Click "Hiện" ở phần "Cấu hình giọng đọc"

### **Bước 4: Chọn Web Speech API**
- Dropdown "Chọn công cụ đọc"
- Chọn: **"🎤 Web Speech API (Browser) - Khuyến nghị"**

### **Bước 5: Tùy chỉnh (Optional)**
- **Chọn giọng đọc**: Chọn giọng bạn thích
- **Tốc độ**: 0.5x - 2.0x
- **Cao độ**: 0 - 2 (1 = bình thường)
- **Âm lượng**: 0 - 1

### **Bước 6: Bắt đầu nghe**
- Click "Bắt đầu từ đầu" hoặc
- Click vào section → "Đọc phần đã chọn"

---

## 🎨 GIAO DIỆN

### **Engine Selector:**
```
┌─────────────────────────────────────┐
│ Chọn công cụ đọc                    │
│ ┌─────────────────────────────────┐ │
│ │ 🎤 Web Speech API (Browser)     │ │
│ │ 🔊 Google Translate TTS         │ │
│ │ 🌟 Google Cloud TTS (nếu có)   │ │
│ └─────────────────────────────────┘ │
│ ✅ Giọng tự nhiên, chạy trên browser│
└─────────────────────────────────────┘
```

### **Status Badge:**
```
┌─────────────────────────────────────┐
│ 🟢 🎤 Web Speech API                │
│ Giọng đọc tự nhiên, không cần server│
└─────────────────────────────────────┘
```

---

## 🎤 GIỌNG ĐỌC

### **Giọng có sẵn:**
Tùy thuộc vào browser và hệ điều hành:

**Chrome/Edge (Windows):**
- Microsoft Hoa - Vietnamese (Female)
- Microsoft Nam - Vietnamese (Male)
- Google Vietnamese (Female)

**Chrome (macOS):**
- Ting-Ting (Chinese)
- Google Vietnamese

**Firefox:**
- eSpeak voices

**Safari (macOS/iOS):**
- Ting-Ting
- Vietnamese voices (nếu có)

### **Chọn giọng:**
1. Mở Voice Settings
2. Dropdown "Chọn giọng đọc"
3. Chọn giọng bạn thích
4. Hoặc để "Tự động" để hệ thống chọn

---

## ⚙️ CẤU HÌNH

### **Tốc độ (Rate):**
- **0.5x**: Rất chậm (dễ nghe)
- **1.0x**: Bình thường (khuyến nghị)
- **1.5x**: Nhanh
- **2.0x**: Rất nhanh

### **Cao độ (Pitch):**
- **0.5**: Giọng trầm
- **1.0**: Bình thường (khuyến nghị)
- **1.5**: Giọng cao
- **2.0**: Rất cao

### **Âm lượng (Volume):**
- **0.0**: Tắt tiếng
- **0.5**: Nhỏ
- **1.0**: Lớn nhất (khuyến nghị)

---

## 🔄 SO SÁNH

### **Web Speech API vs Google Translate TTS:**

| Tính năng | Web Speech API | Google Translate |
|-----------|----------------|------------------|
| Miễn phí | ✅ | ✅ |
| Chất lượng | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Tự nhiên | ✅ Cao | ⚠️ Trung bình |
| Cần server | ❌ Không | ✅ Có |
| Offline | ✅ Có | ❌ Không |
| Pitch control | ✅ 0-2 | ❌ Không |
| Chọn giọng | ✅ Nhiều | ❌ Cố định |

**→ Web Speech API tốt hơn!** ⭐

---

## 🐛 TROUBLESHOOTING

### **Không thấy option Web Speech API?**
**Nguyên nhân**: Browser không hỗ trợ

**Giải pháp**:
- Dùng Chrome/Edge (khuyến nghị)
- Update browser lên version mới nhất
- Kiểm tra console: `'speechSynthesis' in window`

### **Không có giọng Việt?**
**Nguyên nhân**: Hệ điều hành chưa cài giọng Việt

**Giải pháp**:
- **Windows**: Settings → Time & Language → Speech → Add voices
- **macOS**: System Preferences → Accessibility → Speech → System Voice
- Hoặc dùng giọng English (vẫn đọc được tiếng Việt)

### **Giọng đọc bị ngắt quãng?**
**Nguyên nhân**: Text quá dài

**Giải pháp**:
- Hệ thống tự động chia nhỏ text
- Hoặc click vào section nhỏ hơn

### **Không có âm thanh?**
**Giải pháp**:
1. Kiểm tra volume slider (phải > 0)
2. Kiểm tra volume hệ thống
3. Kiểm tra browser không bị mute
4. Thử giọng khác

---

## 💡 TIPS

### **Để giọng đọc tự nhiên nhất:**
1. Chọn Web Speech API
2. Chọn giọng "Microsoft Hoa" (nếu có)
3. Rate: 1.0x
4. Pitch: 1.0
5. Volume: 1.0

### **Để đọc nhanh hơn:**
1. Rate: 1.5x - 2.0x
2. Pitch: 1.0 (giữ nguyên)

### **Để giọng trầm hơn:**
1. Pitch: 0.5 - 0.8
2. Rate: 0.9x (chậm một chút)

---

## 🎯 KEYBOARD SHORTCUTS

Trong tương lai có thể thêm:
- **Space**: Play/Pause
- **→**: Next section
- **←**: Previous section
- **↑**: Increase volume
- **↓**: Decrease volume

---

## 📊 BROWSER SUPPORT

| Browser | Support | Quality |
|---------|---------|---------|
| Chrome | ✅ Excellent | ⭐⭐⭐⭐⭐ |
| Edge | ✅ Excellent | ⭐⭐⭐⭐⭐ |
| Safari | ✅ Good | ⭐⭐⭐⭐ |
| Firefox | ⚠️ Limited | ⭐⭐⭐ |
| Opera | ✅ Good | ⭐⭐⭐⭐ |

**Khuyến nghị: Chrome hoặc Edge**

---

## 🎉 KẾT LUẬN

**Web Speech API là lựa chọn tốt nhất cho UniQuizz:**
- ✅ Miễn phí 100%
- ✅ Không cần API key
- ✅ Không cần billing
- ✅ Giọng đọc tự nhiên
- ✅ Nhiều tùy chỉnh
- ✅ Chạy ngay trên browser

**Bây giờ bạn có thể nghe Miku đọc bài giảng với giọng tự nhiên!** 🎤✨

---

## 📝 CHANGELOG

### **v2.1.0** (Today)
- ✅ Added Web Speech API support
- ✅ Added engine selector
- ✅ Added voice selector
- ✅ Added pitch control (0-2)
- ✅ Auto-detect browser support
- ✅ Fallback to Google Translate TTS
- ✅ Improved UI/UX

**UniQuizz Mentor giờ đây có giọng đọc tự nhiên miễn phí!** 🎊
