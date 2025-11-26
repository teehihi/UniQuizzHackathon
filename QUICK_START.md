# 🚀 Quick Start - Public Sharing Feature

## Bước 1: Chạy Migration (QUAN TRỌNG!)

Trước khi sử dụng tính năng mới, bạn PHẢI chạy migration để cập nhật database:

```bash
cd server
node migrations/add-isPublic-field.js
```

Kết quả mong đợi:
```
🔄 Bắt đầu migration...
✅ Đã kết nối MongoDB
📝 Đang cập nhật Decks...
✅ Đã cập nhật X decks
📝 Đang cập nhật FlashcardSets...
✅ Đã cập nhật X flashcard sets
🎉 Migration hoàn tất!
```

## Bước 2: Restart Server

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm run dev
```

## Bước 3: Test tính năng

### Test Quiz Sharing:

1. **Đăng nhập** vào ứng dụng
2. Vào trang **"Quiz của tôi"** (`/myquizzes`)
3. Tìm một quiz bất kỳ
4. Click nút **"Riêng tư"** → Chuyển thành **"Công khai"** ✅
5. Click nút **"Chia sẻ"** → Copy link
6. **Mở trình duyệt ẩn danh** (Incognito/Private)
7. Paste link và truy cập
8. ✅ Bạn có thể làm quiz mà không cần đăng nhập!

### Test Flashcard Sharing:

1. Vào trang **"Flashcard Hub"** (`/flashcard-hub`)
2. Tìm một flashcard set
3. Làm tương tự như quiz ở trên

## Bước 4: Chia sẻ với người khác

Link có dạng:
- Quiz: `https://your-domain.com/quiz/[quiz-id]`
- Flashcard: `https://your-domain.com/flashcard/[flashcard-id]`

Gửi link qua:
- 📱 Zalo
- 💬 Telegram
- 📘 Facebook
- 🐦 Twitter
- 📧 Email
- Hoặc bất kỳ nền tảng nào!

## ⚠️ Lưu ý

- Quiz/Flashcard mặc định là **Riêng tư** khi tạo mới
- Chỉ owner mới có thể toggle công khai/riêng tư
- Khi đặt về riêng tư, link chia sẻ sẽ không hoạt động nữa
- Người xem quiz công khai KHÔNG thể chỉnh sửa hoặc xóa

## 🐛 Troubleshooting

### Lỗi: "Quiz không tồn tại hoặc chưa được chia sẻ công khai"
→ Kiểm tra quiz đã được toggle sang "Công khai" chưa

### Lỗi: "Vui lòng đăng nhập để xem quiz này"
→ Quiz đang ở chế độ riêng tư, chỉ owner mới xem được

### Migration script báo lỗi
→ Kiểm tra:
- MongoDB có đang chạy không?
- File `.env` có đúng `MONGODB_URI` không?
- Có quyền ghi vào database không?

## 📞 Support

Nếu gặp vấn đề, check:
1. `PROJECT_CHECKLIST.md` - Danh sách tính năng
2. `IMPLEMENTATION_SUMMARY.md` - Chi tiết kỹ thuật
3. `QUIZ_SHARING_GUIDE.md` - Hướng dẫn chi tiết

---

**Chúc bạn sử dụng tính năng mới vui vẻ! 🎉**
