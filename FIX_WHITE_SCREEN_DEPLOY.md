# Fix Màn Hình Trắng Khi Deploy

## Vấn đề
Khi deploy client lên Vercel và server lên Render, trang web hiển thị màn hình trắng. Phải ấn Ctrl + Shift + R mới load được.

## Nguyên nhân
- Service Worker cache quá mạnh
- Browser cache file cũ
- Vercel cache HTML/JS/CSS

## Giải pháp đã áp dụng

### 1. Tắt Service Worker
File `client/src/App.jsx` đã được cập nhật để **unregister** tất cả Service Worker cũ.

### 2. Clear Cache khi load
File `client/src/main.jsx` đã thêm code để xóa tất cả cache khi app khởi động.

### 3. Cấu hình Vercel Headers
File `vercel.json` đã được cập nhật với:
- `index.html`: no-cache (luôn fetch mới)
- `/assets/*`, `.js`, `.css`: cache 1 năm với immutable (vì Vite đã hash filename)

## Cách deploy

### Bước 1: Commit và push code mới
```bash
git add .
git commit -m "fix: Remove Service Worker to fix white screen issue"
git push
```

### Bước 2: Deploy lên Vercel
Vercel sẽ tự động deploy khi bạn push code.

### Bước 3: Clear cache trên Vercel (quan trọng!)
1. Vào Vercel Dashboard
2. Chọn project UniQuizz
3. Vào tab **Settings** → **General**
4. Scroll xuống phần **Build & Development Settings**
5. Click **Clear Cache** hoặc **Redeploy**

### Bước 4: Clear cache trên browser
Sau khi deploy xong, người dùng cần:
- **Lần đầu**: Ấn `Ctrl + Shift + R` (hard refresh) để xóa cache cũ
- **Lần sau**: Vào link sẽ hiển thị ngay, không cần refresh nữa

## Kiểm tra

### Test 1: Mở incognito/private window
```
1. Mở Chrome Incognito
2. Vào https://your-domain.vercel.app
3. Trang phải load ngay, không trắng
```

### Test 2: Clear cache và reload
```
1. Mở DevTools (F12)
2. Right-click vào nút Reload
3. Chọn "Empty Cache and Hard Reload"
4. Trang phải load ngay
```

### Test 3: Kiểm tra Service Worker
```
1. Mở DevTools (F12)
2. Vào tab Application → Service Workers
3. Phải thấy "No service workers" hoặc status "redundant"
```

## Nếu vẫn bị trắng

### Option 1: Force clear cache trên Vercel
```bash
# Trong terminal
vercel --prod --force
```

### Option 2: Thay đổi domain hoặc subdomain
Nếu cache quá cứng đầu, thử deploy lên subdomain mới hoặc custom domain.

### Option 3: Thêm version query param
Trong `client/index.html`, thêm version vào script:
```html
<script type="module" src="/src/main.jsx?v=2"></script>
```

## Lưu ý quan trọng

1. **Không bật lại Service Worker** cho đến khi fix được vấn đề cache
2. **Vercel cache rất mạnh**, nhớ clear cache sau mỗi deploy
3. **Browser cache** cũng cần clear lần đầu sau khi deploy fix này
4. Sau khi fix, người dùng mới vào sẽ không gặp vấn đề nữa

## Kết quả mong đợi
✅ Vào link → Hiển thị ngay, không trắng
✅ Không cần Ctrl + Shift + R
✅ Load nhanh, không bị cache sai
✅ Mọi người dùng đều thấy version mới nhất

## Tái kích hoạt PWA (sau này)
Nếu muốn bật lại PWA/Service Worker:
1. Fix logic cache trong `client/public/sw.js`
2. Test kỹ trên local và staging
3. Đảm bảo có cơ chế update tự động
4. Uncomment code trong `client/src/App.jsx`
