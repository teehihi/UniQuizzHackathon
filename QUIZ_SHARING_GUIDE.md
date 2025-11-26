# Hướng dẫn Chia sẻ Quiz Công khai

## Tính năng mới

Bây giờ bạn có thể chia sẻ quiz của mình với bất kỳ ai mà không yêu cầu họ đăng nhập!

## Cách sử dụng

### 1. Đặt Quiz thành Công khai

1. Vào trang **"Quiz của tôi"** (`/myquizzes`)
2. Tìm quiz bạn muốn chia sẻ
3. Click vào nút **"Riêng tư"** để chuyển thành **"Công khai"**
4. Quiz của bạn giờ đã có thể truy cập bởi bất kỳ ai có link!

### 2. Chia sẻ Link

1. Click vào nút **"Chia sẻ"** (biểu tượng chia sẻ) trên quiz card
2. Copy link được tạo ra
3. Gửi link cho bạn bè, học sinh, hoặc đồng nghiệp

### 3. Người khác truy cập Quiz

- Người nhận link **KHÔNG CẦN đăng nhập** để làm quiz
- Họ chỉ cần click vào link và bắt đầu làm ngay
- Link có dạng: `https://your-domain.com/quiz/[quiz-id]`

## Quyền riêng tư

### Quiz Công khai
- ✅ Bất kỳ ai có link đều có thể xem và làm quiz
- ✅ Không cần đăng nhập
- ✅ Phù hợp cho: Chia sẻ với lớp học, nhóm học tập, cộng đồng

### Quiz Riêng tư
- 🔒 Chỉ bạn (người tạo) mới xem và làm được
- 🔒 Yêu cầu đăng nhập
- 🔒 Phù hợp cho: Quiz cá nhân, bản nháp

## Thay đổi kỹ thuật

### Backend (Server)

1. **Model Deck** (`server/models/Deck.js`)
   - Thêm field `isPublic: Boolean` (mặc định `false`)

2. **API Routes** (`server/apiRoutes.js`)
   - `GET /api/decks/public/:id` - Lấy quiz công khai (không cần token)
   - `PATCH /api/decks/:id/public` - Cập nhật trạng thái công khai/riêng tư

### Frontend (Client)

1. **QuizPlayer** (`client/src/pages/QuizPlayer.jsx`)
   - Thử fetch quiz công khai trước
   - Nếu không phải public, mới yêu cầu đăng nhập

2. **QuizCard** (`client/src/components/QuizCard.jsx`)
   - Thêm nút toggle công khai/riêng tư
   - Hiển thị badge trạng thái

3. **API Config** (`client/src/config/api.js`)
   - Thêm endpoint `DECK_PUBLIC` và `DECK_UPDATE_PUBLIC`

## Lưu ý

- Quiz mặc định là **Riêng tư** khi tạo mới
- Bạn có thể chuyển đổi giữa Công khai ↔ Riêng tư bất cứ lúc nào
- Khi đặt về Riêng tư, link chia sẻ sẽ không còn hoạt động
