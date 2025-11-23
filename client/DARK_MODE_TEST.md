# Hướng dẫn Test Dark Mode

## Các bước để test:

1. **Restart dev server** (quan trọng!):
   ```bash
   # Dừng server hiện tại (Ctrl+C)
   # Sau đó chạy lại:
   npm run dev
   ```

2. **Mở browser và kiểm tra Console**:
   - Mở DevTools (F12)
   - Vào tab Console
   - Click vào nút toggle ở góc trên phải
   - Bạn sẽ thấy log: "Toggle theme clicked, current: false/true"
   - Và: "Theme changed to: dark/light"

3. **Kiểm tra HTML element**:
   - Mở DevTools > Elements
   - Xem thẻ `<html>` 
   - Khi click toggle, class `dark` sẽ được thêm/xóa: `<html class="dark">`

4. **Kiểm tra localStorage**:
   - DevTools > Application > Local Storage
   - Xem key `theme` có giá trị `dark` hoặc `light`

## Nếu vẫn không hoạt động:

1. **Clear cache và reload**:
   - Ctrl + Shift + R (hard reload)
   - Hoặc xóa cache trong DevTools

2. **Kiểm tra Tailwind CSS đã load**:
   - Mở DevTools > Network
   - Reload trang
   - Tìm file CSS, xem có chứa class `.dark` không

3. **Test file HTML đơn giản**:
   - Mở file `test-dark-mode.html` trong browser
   - Click nút toggle
   - Nếu file này hoạt động → vấn đề ở React app
   - Nếu file này không hoạt động → vấn đề ở Tailwind config

## Debug ThemeContext:

Thêm code này vào component bất kỳ để test:

```jsx
import { useTheme } from './contexts/ThemeContext';

function TestComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {isDark ? 'DARK' : 'LIGHT'}</p>
      <p>HTML class: {document.documentElement.className}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```
