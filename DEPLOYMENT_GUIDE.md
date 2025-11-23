# 🚀 HƯỚNG DẪN DEPLOY UNIQUIZZ

## 📋 Checklist Trước Khi Deploy

### **1. Cấu hình Environment Variables**

#### **Client (.env)**
```bash
# Tạo file client/.env
VITE_APP_URL=https://your-domain.com
VITE_API_URL=https://your-api-domain.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### **Server (.env)**
```bash
# File server/.env đã có
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
GOOGLE_APPLICATION_CREDENTIALS=./config/google-tts-credentials.json
```

---

## 🌐 Deploy Options

### **Option 1: Vercel (Recommended cho Frontend)**

#### **Deploy Client:**
```bash
cd client
npm install -g vercel
vercel login
vercel

# Hoặc connect với GitHub
# 1. Push code lên GitHub
# 2. Import project vào Vercel
# 3. Set environment variables
```

#### **Vercel Environment Variables:**
```
VITE_APP_URL = https://your-app.vercel.app
VITE_API_URL = https://your-api.herokuapp.com
VITE_GA_MEASUREMENT_ID = G-XXXXXXXXXX
```

---

### **Option 2: Netlify (Alternative cho Frontend)**

#### **Deploy Client:**
```bash
cd client
npm run build

# Upload dist folder to Netlify
# Hoặc connect với GitHub
```

#### **netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_APP_URL = "https://your-app.netlify.app"
  VITE_API_URL = "https://your-api.herokuapp.com"
```

---

### **Option 3: Heroku (Recommended cho Backend)**

#### **Deploy Server:**
```bash
cd server

# Login to Heroku
heroku login

# Create app
heroku create uniquizz-api

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secret"
heroku config:set GEMINI_API_KEY="your-key"

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

#### **Procfile:**
```
web: node server.js
```

---

### **Option 4: Railway (Modern Alternative)**

#### **Deploy Full Stack:**
```bash
# 1. Sign up at railway.app
# 2. New Project → Deploy from GitHub
# 3. Add environment variables
# 4. Deploy!
```

**Advantages:**
- ✅ Free tier generous
- ✅ Auto deploy on push
- ✅ Easy database setup
- ✅ Good for monorepo

---

### **Option 5: Render (Free Tier)**

#### **Deploy Backend:**
```bash
# 1. Sign up at render.com
# 2. New Web Service
# 3. Connect GitHub repo
# 4. Build Command: cd server && npm install
# 5. Start Command: cd server && npm start
# 6. Add environment variables
```

#### **Deploy Frontend:**
```bash
# 1. New Static Site
# 2. Build Command: cd client && npm install && npm run build
# 3. Publish Directory: client/dist
# 4. Add environment variables
```

---

## 🔧 Build Commands

### **Client:**
```bash
cd client
npm install
npm run build
# Output: dist/
```

### **Server:**
```bash
cd server
npm install
npm start
# Runs on PORT from env or 3001
```

---

## 🌍 Domain Setup

### **1. Custom Domain (Vercel):**
```bash
# Vercel Dashboard → Settings → Domains
# Add: uniquizz.com
# Update DNS:
# Type: CNAME
# Name: @
# Value: cname.vercel-dns.com
```

### **2. Custom Domain (Netlify):**
```bash
# Netlify Dashboard → Domain Settings
# Add custom domain
# Update DNS:
# Type: A
# Name: @
# Value: 75.2.60.5
```

### **3. SSL Certificate:**
- ✅ Vercel: Auto SSL (Let's Encrypt)
- ✅ Netlify: Auto SSL
- ✅ Heroku: Auto SSL
- ✅ Railway: Auto SSL

---

## 📊 Post-Deployment Checklist

### **1. Test All Features:**
```
✓ Homepage loads
✓ Register/Login works
✓ Create quiz works
✓ Quiz player works
✓ Flashcard works
✓ Mentor page works
✓ Dashboard works
✓ Share buttons work (with production URL)
✓ Dark mode works
✓ Mobile responsive
```

### **2. SEO Setup:**
```
✓ Update sitemap.xml with production URL
✓ Submit to Google Search Console
✓ Test Open Graph tags (Facebook Debugger)
✓ Test Twitter Cards
✓ Add Google Analytics
```

### **3. Performance:**
```
✓ Run Lighthouse audit
✓ Check load times
✓ Optimize images
✓ Enable compression
✓ Setup CDN (optional)
```

### **4. Security:**
```
✓ HTTPS enabled
✓ CORS configured correctly
✓ Environment variables secure
✓ Rate limiting enabled
✓ Input validation
```

---

## 🔄 CI/CD Setup (Optional)

### **GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          cd client
          npm install
          npm run build
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        run: |
          cd server
          git push heroku main
```

---

## 📝 Update URLs After Deploy

### **1. Update ShareButton:**
```javascript
// client/src/config/constants.js
PRODUCTION_URL: 'https://your-actual-domain.com'
```

### **2. Update API Endpoints:**
```javascript
// client/src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api.com';
```

### **3. Update CORS:**
```javascript
// server/server.js
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];
```

### **4. Update Sitemap:**
```xml
<!-- client/public/sitemap.xml -->
<loc>https://your-domain.com/</loc>
```

### **5. Update index.html:**
```html
<!-- client/index.html -->
<link rel="canonical" href="https://your-domain.com" />
<meta property="og:url" content="https://your-domain.com" />
```

---

## 🐛 Troubleshooting

### **Issue: Share button shows localhost**
```javascript
// Solution: Set VITE_APP_URL in production
VITE_APP_URL=https://your-domain.com
```

### **Issue: API calls fail**
```javascript
// Solution: Update CORS and API URL
// Server: Add production URL to allowedOrigins
// Client: Set VITE_API_URL
```

### **Issue: 404 on refresh**
```javascript
// Solution: Add redirect rules
// Vercel: vercel.json
// Netlify: netlify.toml
// See examples above
```

### **Issue: Environment variables not working**
```bash
# Solution: Rebuild after setting env vars
npm run build
```

---

## 💰 Cost Estimate

### **Free Tier (Recommended for Start):**
- **Vercel**: Free (100GB bandwidth/month)
- **Netlify**: Free (100GB bandwidth/month)
- **Heroku**: Free tier discontinued, use alternatives
- **Railway**: $5/month (500 hours)
- **Render**: Free (750 hours/month)
- **MongoDB Atlas**: Free (512MB)
- **Google Cloud TTS**: Free (1M chars/month)

**Total: $0-5/month** 🎉

### **Paid Tier (For Scale):**
- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month
- **MongoDB Atlas**: $9/month (2GB)
- **Domain**: $10-15/year

**Total: ~$50/month**

---

## 🎯 Recommended Stack

**For UniQuizz:**
```
Frontend: Vercel (Free)
Backend: Railway (Free/Paid)
Database: MongoDB Atlas (Free)
Domain: Namecheap ($10/year)
CDN: Cloudflare (Free)
Analytics: Google Analytics (Free)
```

**Total Cost: $10/year** (just domain!)

---

## 📞 Support

Nếu gặp vấn đề khi deploy:
1. Check logs (vercel logs, heroku logs)
2. Test locally first
3. Verify environment variables
4. Check CORS settings
5. Contact: teeforwork21@gmail.com

**Happy Deploying!** 🚀✨
