# 🎯 SEO & Meta Tags Implementation Guide

## ✅ Đã Hoàn Thành

### 1. Base Meta Tags (index.html)
- ✅ Title, description, keywords
- ✅ Open Graph tags (Facebook)
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Structured Data (Schema.org)
- ✅ PWA manifest
- ✅ Favicon & icons

### 2. Dynamic Meta Tags Component
- ✅ `SEOHead.jsx` - Component cập nhật meta tags động
- ✅ Helper functions cho Quiz, Flashcard, Topic
- ✅ Tích hợp vào QuizPlayer
- ✅ Tích hợp vào FlashcardPage

## 📋 Cấu Trúc Meta Tags

### Base Tags (Tất cả trang)
```html
<title>UniQuizz - Tạo Quiz Tự Động Bằng AI</title>
<meta name="description" content="..." />
<meta name="keywords" content="..." />
<meta name="author" content="UniQuizz" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://uniquizz.com" />
```

### Open Graph (Facebook, LinkedIn)
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://uniquizz.com" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://uniquizz.com/og-image.png" />
<meta property="og:locale" content="vi_VN" />
<meta property="og:site_name" content="UniQuizz" />
```

### Twitter Card
```html
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="..." />
<meta property="twitter:title" content="..." />
<meta property="twitter:description" content="..." />
<meta property="twitter:image" content="..." />
```

### Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "UniQuizz",
  "description": "...",
  "url": "https://uniquizz.com",
  "applicationCategory": "EducationalApplication"
}
```

## 🎨 Social Preview Images

### Kích Thước Khuyến Nghị

**Facebook / LinkedIn:**
- Kích thước: 1200 x 630px
- Tỷ lệ: 1.91:1
- Format: PNG hoặc JPG
- Dung lượng: < 8MB

**Twitter:**
- Kích thước: 1200 x 675px (hoặc 1200 x 630px)
- Tỷ lệ: 16:9 (hoặc 1.91:1)
- Format: PNG, JPG, WEBP
- Dung lượng: < 5MB

**General:**
- Kích thước an toàn: 1200 x 630px
- Text zone an toàn: Tránh 250px từ mỗi cạnh
- Logo: Đặt ở góc trên trái hoặc giữa
- Text: Rõ ràng, dễ đọc, font size lớn

### Nội Dung Ảnh Preview

**Trang chủ:**
- Logo UniQuizz
- Tagline: "Tạo Quiz Tự Động Bằng AI"
- Subtitle: "Học nhanh, nhớ lâu, tiết kiệm thời gian"
- Background: Gradient đỏ-cam-vàng

**Quiz Page:**
- Title quiz
- Số câu hỏi
- Icon quiz
- Logo UniQuizz nhỏ ở góc

**Flashcard Page:**
- Title flashcard set
- Số thẻ
- Icon flashcard
- Logo UniQuizz nhỏ ở góc

## 🛠️ Cách Sử Dụng SEOHead Component

### Basic Usage
```jsx
import SEOHead from '../components/SEOHead';

function MyPage() {
  return (
    <>
      <SEOHead 
        title="My Page Title"
        description="My page description"
        image="https://example.com/image.png"
      />
      {/* Page content */}
    </>
  );
}
```

### Quiz Page
```jsx
import SEOHead, { getQuizMeta } from '../components/SEOHead';

function QuizPlayer() {
  const [quiz, setQuiz] = useState(null);
  
  return (
    <>
      {quiz && <SEOHead {...getQuizMeta(quiz)} />}
      {/* Quiz content */}
    </>
  );
}
```

### Flashcard Page
```jsx
import SEOHead, { getFlashcardMeta } from '../components/SEOHead';

function FlashcardPage() {
  const [flashcardSet, setFlashcardSet] = useState(null);
  
  return (
    <>
      {flashcardSet && <SEOHead {...getFlashcardMeta(flashcardSet)} />}
      {/* Flashcard content */}
    </>
  );
}
```

## 🧪 Testing Meta Tags

### 1. Facebook Debugger
URL: https://developers.facebook.com/tools/debug/

**Cách test:**
1. Paste URL của bạn
2. Click "Debug"
3. Xem preview
4. Click "Scrape Again" nếu cần refresh

### 2. Twitter Card Validator
URL: https://cards-dev.twitter.com/validator

**Cách test:**
1. Paste URL của bạn
2. Click "Preview card"
3. Xem preview

### 3. LinkedIn Post Inspector
URL: https://www.linkedin.com/post-inspector/

**Cách test:**
1. Paste URL của bạn
2. Click "Inspect"
3. Xem preview

### 4. Google Rich Results Test
URL: https://search.google.com/test/rich-results

**Cách test:**
1. Paste URL hoặc code
2. Click "Test URL"
3. Xem structured data

### 5. Browser DevTools
**Cách test:**
1. Mở DevTools (F12)
2. Tab "Elements"
3. Tìm `<head>` section
4. Kiểm tra meta tags

## 📊 SEO Checklist

### On-Page SEO
- ✅ Unique title cho mỗi trang
- ✅ Meta description (150-160 characters)
- ✅ H1 tag (1 per page)
- ✅ H2-H6 tags (hierarchical)
- ✅ Alt text cho images
- ✅ Internal linking
- ✅ Mobile-friendly
- ✅ Fast loading speed

### Technical SEO
- ✅ HTTPS enabled
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Structured data
- ✅ 404 page
- ✅ Redirects (301)

### Social SEO
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Preview images
- ✅ Share buttons
- ✅ Social links

## 🎯 Best Practices

### Title Tags
- Length: 50-60 characters
- Include main keyword
- Brand name at end
- Unique per page
- Compelling & descriptive

**Good:**
```
"Làm Quiz Toán Học - 50 Câu Hỏi | UniQuizz"
```

**Bad:**
```
"Quiz | UniQuizz"
```

### Meta Descriptions
- Length: 150-160 characters
- Include call-to-action
- Include main keyword
- Unique per page
- Compelling & informative

**Good:**
```
"Làm quiz Toán Học với 50 câu hỏi thú vị. 
Kiểm tra kiến thức, học nhanh nhớ lâu. 
Bắt đầu ngay không cần đăng nhập!"
```

**Bad:**
```
"Quiz về toán học"
```

### Image Alt Text
- Descriptive & concise
- Include keywords naturally
- Don't stuff keywords
- Describe image content

**Good:**
```
alt="Học sinh làm quiz toán học trên UniQuizz"
```

**Bad:**
```
alt="quiz toán học quiz online quiz ai quiz tự động"
```

## 🚀 Next Steps

### Immediate
1. ✅ Tạo og-image.png (1200x630px)
2. ✅ Test meta tags trên Facebook Debugger
3. ✅ Test meta tags trên Twitter Validator
4. ✅ Verify structured data

### Short-term
- [ ] Tạo dynamic og-image cho từng quiz
- [ ] Add breadcrumbs schema
- [ ] Add FAQ schema (nếu có)
- [ ] Optimize images (WebP, lazy loading)

### Long-term
- [ ] Generate sitemap.xml tự động
- [ ] Add blog for content marketing
- [ ] Build backlinks
- [ ] Monitor Google Search Console
- [ ] Track social shares analytics

## 📝 Environment Variables

Thêm vào `.env`:
```env
VITE_APP_URL=https://uniquizz.com
VITE_APP_NAME=UniQuizz
VITE_APP_DESCRIPTION=Tạo Quiz Tự Động Bằng AI
```

## 🔧 Troubleshooting

### Meta tags không cập nhật
**Giải pháp:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check DevTools Elements tab
4. Verify SEOHead component is rendering

### Facebook không hiển thị ảnh
**Giải pháp:**
1. Verify image URL is absolute (https://)
2. Image size >= 200x200px
3. Image format: JPG, PNG, GIF
4. Use Facebook Debugger to scrape again

### Twitter card không hiển thị
**Giải pháp:**
1. Verify twitter:card meta tag
2. Image size: 1200x675px recommended
3. Use Twitter Card Validator
4. Wait 24h for cache to clear

---

**SEO implementation hoàn tất! 🎉**
