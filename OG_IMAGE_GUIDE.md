# 🎨 Open Graph Image Creation Guide

## 📐 Kích Thước & Specs

### Recommended Size
- **Width:** 1200px
- **Height:** 630px
- **Aspect Ratio:** 1.91:1
- **Format:** PNG (preferred) or JPG
- **File Size:** < 8MB (< 1MB recommended)
- **Color Mode:** RGB

### Safe Zones
- **Text Safe Zone:** 250px from each edge
- **Logo Safe Zone:** 100px from edges
- **Center Content:** 700px x 330px area

## 🎨 Design Elements

### For Homepage (og-image.png)

**Layout:**
```
┌─────────────────────────────────────┐
│  Logo (top-left)                    │
│                                     │
│         UniQuizz                    │
│    Tạo Quiz Tự Động Bằng AI        │
│                                     │
│  Học nhanh • Nhớ lâu • Tiết kiệm   │
│                                     │
│  [Icon Quiz] [Icon AI] [Icon Flash]│
└─────────────────────────────────────┘
```

**Colors:**
- Background: Gradient from #dc2626 (red) to #f97316 (orange)
- Text: White (#ffffff)
- Accent: Yellow (#fbbf24)

**Typography:**
- Title: Bold, 72-96px
- Subtitle: Medium, 48-60px
- Body: Regular, 32-40px

**Elements:**
- Logo UniQuizz (top-left, 150x150px)
- Main title centered
- Subtitle centered
- 3 icons at bottom (quiz, AI, flashcard)
- Decorative elements (optional)

### For Quiz Pages (Dynamic)

**Layout:**
```
┌─────────────────────────────────────┐
│  📝 Quiz                            │
│                                     │
│     [Quiz Title]                    │
│                                     │
│  50 câu hỏi • Toán Học             │
│                                     │
│  UniQuizz (logo small)             │
└─────────────────────────────────────┘
```

**Colors:**
- Background: Red gradient
- Text: White
- Badge: Semi-transparent white

### For Flashcard Pages (Dynamic)

**Layout:**
```
┌─────────────────────────────────────┐
│  🎴 Flashcard                       │
│                                     │
│     [Flashcard Title]               │
│                                     │
│  100 thẻ • Từ Vựng Tiếng Anh      │
│                                     │
│  UniQuizz (logo small)             │
└─────────────────────────────────────┘
```

**Colors:**
- Background: Blue-Purple gradient
- Text: White
- Badge: Semi-transparent white

## 🛠️ Tools để Tạo OG Image

### Online Tools (Free)

**1. Canva**
- URL: https://www.canva.com
- Template: Social Media → Facebook Post
- Custom size: 1200 x 630px
- Free templates available

**2. Figma**
- URL: https://www.figma.com
- Create frame: 1200 x 630px
- Export as PNG
- Free for personal use

**3. Adobe Express**
- URL: https://www.adobe.com/express
- Social media templates
- Easy to use
- Free tier available

**4. Placid.app**
- URL: https://placid.app
- Dynamic image generation
- API available
- Free tier: 100 images/month

### Code-based (Dynamic)

**1. Puppeteer (Node.js)**
```javascript
const puppeteer = require('puppeteer');

async function generateOGImage(title, description) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 630 });
  
  const html = `
    <html>
      <body style="
        margin: 0;
        background: linear-gradient(135deg, #dc2626, #f97316);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      ">
        <div style="text-align: center; color: white;">
          <h1 style="font-size: 72px; margin: 0;">${title}</h1>
          <p style="font-size: 36px;">${description}</p>
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  await page.screenshot({ path: 'og-image.png' });
  await browser.close();
}
```

**2. Canvas (Node.js)**
```javascript
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function generateOGImage(title) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#dc2626');
  gradient.addColorStop(1, '#f97316');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 600, 315);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('og-image.png', buffer);
}
```

**3. Cloudinary (Dynamic)**
```javascript
// Using Cloudinary transformations
const ogImageUrl = `https://res.cloudinary.com/your-cloud/image/upload/
  w_1200,h_630,c_fill,
  l_text:Arial_72_bold:${encodeURIComponent(title)},
  co_white,g_center/
  background.png`;
```

## 📝 Step-by-Step: Canva

### 1. Create Design
1. Go to Canva.com
2. Click "Create a design"
3. Custom size: 1200 x 630px
4. Click "Create new design"

### 2. Design Layout
1. Add background:
   - Elements → Gradients
   - Choose red-orange gradient
   
2. Add logo:
   - Upload your logo
   - Place at top-left
   - Size: ~150px
   
3. Add title:
   - Text → Heading
   - Font: Bold, 72-96px
   - Color: White
   - Center align
   
4. Add subtitle:
   - Text → Subheading
   - Font: Medium, 48px
   - Color: White
   - Center align

### 3. Export
1. Click "Share" → "Download"
2. File type: PNG
3. Quality: High
4. Download

### 4. Optimize
1. Use TinyPNG.com to compress
2. Target: < 500KB
3. Upload to `/client/public/og-image.png`

## 🎯 Design Tips

### Typography
- ✅ Use bold, readable fonts
- ✅ High contrast (white on dark)
- ✅ Large font sizes (72px+)
- ✅ Limit to 2-3 font sizes
- ❌ Don't use thin fonts
- ❌ Don't use too many fonts

### Colors
- ✅ Use brand colors
- ✅ High contrast
- ✅ Gradients for depth
- ✅ Consistent palette
- ❌ Don't use low contrast
- ❌ Don't use too many colors

### Layout
- ✅ Center important content
- ✅ Use safe zones
- ✅ Balance elements
- ✅ White space is good
- ❌ Don't crowd the design
- ❌ Don't place text at edges

### Content
- ✅ Clear, concise message
- ✅ Include brand name
- ✅ Show value proposition
- ✅ Use icons/emojis
- ❌ Don't use too much text
- ❌ Don't use small text

## 🧪 Testing

### Preview Tools
1. **Facebook Debugger**
   - https://developers.facebook.com/tools/debug/
   - Paste URL → Debug → See preview

2. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Paste URL → Preview card

3. **LinkedIn Inspector**
   - https://www.linkedin.com/post-inspector/
   - Paste URL → Inspect

### Checklist
- [ ] Image loads correctly
- [ ] Text is readable
- [ ] Logo is visible
- [ ] Colors look good
- [ ] File size < 1MB
- [ ] Dimensions: 1200x630px
- [ ] Format: PNG or JPG

## 📦 Assets Needed

### For UniQuizz
1. **og-image.png** (Homepage)
   - 1200x630px
   - Red-orange gradient
   - Logo + title + tagline

2. **logo.png** (Fallback)
   - Square (512x512px recommended)
   - Transparent background
   - PNG format

3. **favicon.png** (Browser tab)
   - 32x32px or 64x64px
   - PNG format
   - Simple, recognizable

## 🚀 Implementation

### Static Image
```html
<!-- In index.html -->
<meta property="og:image" content="https://uniquizz.com/og-image.png" />
```

### Dynamic Image (Future)
```javascript
// Generate per quiz/flashcard
const ogImageUrl = await generateOGImage({
  title: quiz.title,
  type: 'quiz',
  count: quiz.questions.length
});

// Update meta tag
<meta property="og:image" content={ogImageUrl} />
```

---

**Tạo og-image đẹp để link chia sẻ nổi bật! 🎨**
