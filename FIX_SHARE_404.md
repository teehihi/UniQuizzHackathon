# Fix Lỗi 404 Khi Chia Sẻ Quiz

## Vấn đề
Khi chia sẻ quiz qua link (ví dụ: `https://uniquizzdom.vercel.app/quiz/123`), người dùng vào link bị 404 Not Found.

## Nguyên nhân
1. **URL có dấu `/` thừa**: `VITE_APP_URL` trong `.env` có dấu `/` ở cuối → tạo ra URL sai
2. **Biến môi trường chưa set trên Vercel**: Vercel không biết `VITE_APP_URL`
3. **Routing chưa đúng**: SPA routing cần config đúng trên Vercel

## Giải pháp đã áp dụng

### 1. Fix file `.env` local
File `client/.env` đã được sửa:
```env
# ❌ SAI (có khoảng trắng và dấu / ở cuối)
VITE_APP_URL= https://uniquizzdom.vercel.app/

# ✅ ĐÚNG (không có khoảng trắng và dấu /)
VITE_APP_URL=https://uniquizzdom.vercel.app
```

### 2. Vercel config đã đúng
File `vercel.json` đã có config rewrite tất cả routes về `/index.html` để SPA routing hoạt động.

## Cách fix trên Vercel (QUAN TRỌNG!)

### Bước 1: Set biến môi trường trên Vercel
1. Vào **Vercel Dashboard** → Chọn project **UniQuizz**
2. Vào tab **Settings** → **Environment Variables**
3. Thêm biến mới:
   - **Name**: `VITE_APP_URL`
   - **Value**: `https://uniquizzdom.vercel.app` (KHÔNG có dấu `/` ở cuối)
   - **Environment**: Chọn **Production**, **Preview**, và **Development**
4. Click **Save**

### Bước 2: Redeploy
Sau khi thêm biến môi trường, bạn cần redeploy:

**Option A: Redeploy từ Vercel Dashboard**
1. Vào tab **Deployments**
2. Click vào deployment mới nhất
3. Click nút **...** (3 chấm) → **Redeploy**
4. Chọn **Use existing Build Cache** → **Redeploy**

**Option B: Push code mới**
```bash
git add .
git commit -m "fix: Remove trailing slash from VITE_APP_URL"
git push
```

### Bước 3: Test share link
Sau khi deploy xong:
1. Vào trang MyQuizzes
2. Click nút **Chia sẻ** trên một quiz
3. Copy link
4. Mở **Incognito/Private window**
5. Paste link và Enter
6. Trang phải load quiz, không bị 404

## Kiểm tra URL đang dùng

### Test trên local
```bash
# Trong terminal, chạy:
cd client
npm run dev

# Mở browser console (F12) và gõ:
console.log(import.meta.env.VITE_APP_URL)
# Phải thấy: https://uniquizzdom.vercel.app (không có dấu /)
```

### Test trên production
1. Mở trang web đã deploy
2. Mở DevTools (F12) → Console
3. Gõ: `window.location.origin`
4. Phải thấy: `https://uniquizzdom.vercel.app`

## Các trường hợp đặc biệt

### Nếu vẫn bị 404 sau khi fix

#### 1. Clear Vercel cache
```bash
# Trong terminal local
vercel --prod --force
```

#### 2. Kiểm tra quiz ID có tồn tại không
- Vào MongoDB/Database
- Tìm quiz với ID trong link
- Nếu không có → Quiz đã bị xóa

#### 3. Kiểm tra route trong App.jsx
Route phải có dạng:
```jsx
<Route path="/quiz/:quizId" element={<QuizPlayer />} />
```

#### 4. Kiểm tra QuizPlayer component
Component phải lấy `quizId` từ URL params:
```jsx
import { useParams } from 'react-router-dom';

const { quizId } = useParams();
```

### Nếu share link không đúng domain

Trong `client/.env` trên Vercel, đảm bảo:
```env
# Nếu domain chính thức là uniquizz.com
VITE_APP_URL=https://uniquizz.com

# Nếu dùng subdomain Vercel
VITE_APP_URL=https://uniquizzdom.vercel.app

# Nếu có custom domain
VITE_APP_URL=https://your-custom-domain.com
```

## Lưu ý quan trọng

1. **KHÔNG có dấu `/` ở cuối URL** trong `VITE_APP_URL`
2. **KHÔNG có khoảng trắng** trước hoặc sau URL
3. **Phải set biến môi trường trên Vercel**, không chỉ trong file `.env` local
4. **Phải redeploy** sau khi thay đổi biến môi trường
5. File `.env` local **KHÔNG được commit** lên Git (đã có trong `.gitignore`)

## Kết quả mong đợi

✅ Share link có dạng: `https://uniquizzdom.vercel.app/quiz/abc123`
✅ Người dùng click vào link → Load quiz ngay
✅ Không bị 404 Not Found
✅ Không bị double slash `//`
✅ Share lên Facebook/Twitter/Zalo đều hoạt động

## Debug nếu vẫn lỗi

### 1. Kiểm tra network request
1. Mở DevTools (F12) → Network tab
2. Vào link share
3. Xem request đầu tiên:
   - Status phải là `200` (không phải `404`)
   - Response phải là HTML của `index.html`

### 2. Kiểm tra console errors
1. Mở DevTools (F12) → Console tab
2. Xem có lỗi gì không:
   - `Failed to fetch` → API server không hoạt động
   - `Quiz not found` → Quiz ID không tồn tại
   - `404` → Routing config sai

### 3. Kiểm tra Vercel logs
1. Vào Vercel Dashboard → Deployments
2. Click vào deployment mới nhất
3. Xem **Function Logs** và **Build Logs**
4. Tìm lỗi liên quan đến routing

## Tóm tắt các bước fix

```bash
# 1. Fix local .env (đã làm)
# Xóa dấu / và khoảng trắng trong VITE_APP_URL

# 2. Set env trên Vercel
# Vào Settings → Environment Variables
# Thêm VITE_APP_URL=https://uniquizzdom.vercel.app

# 3. Redeploy
git add .
git commit -m "fix: Share link 404 issue"
git push

# 4. Test
# Mở incognito, paste share link, phải load được quiz
```

Xong! 🎉
