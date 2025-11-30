# 🎓 UniQuizz - AI-Powered Learning Platform

<div align="center">

![UniQuizz Logo](client/public/logo.png)

**Nền tảng học tập thông minh với AI - Tạo Quiz, Flashcard và Học với Mentor AI**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Demo](#-demo) • [Tính năng](#-tính-năng-chính) • [Cài đặt](#-cài-đặt) • [Sử dụng](#-hướng-dẫn-sử-dụng) • [API](#-api-documentation)

</div>

---

## 🌐 Demo

### 🚀 Live Demo

**Truy cập ngay:** [https://uniquizzdom.vercel.app](https://uniquizzdom.vercel.app)

### 🎮 Test Account

Để trải nghiệm nhanh, bạn có thể sử dụng tài khoản demo:

```
Email: demo@uniquizz.com
Password: demo123456
```

*Hoặc đăng ký tài khoản mới miễn phí!*

### ✨ Tính năng có thể thử ngay

1. **🎯 Tạo Quiz từ file**
   - Upload file PDF/DOCX/PPTX mẫu
   - Hoặc paste URL bài viết bất kỳ
   - AI sẽ tạo quiz trong vài giây

2. **🗂️ Tạo Flashcard**
   - Upload tài liệu học
   - AI tạo flashcard thông minh
   - Học với chế độ flip card

3. **👩‍🏫 Chat với Mentor AI**
   - Upload bài giảng
   - Hỏi đáp với Miku
   - Nghe giảng bài với TTS

4. **🔍 Tìm kiếm Quiz công khai**
   - Tìm quiz từ cộng đồng
   - Làm quiz không cần đăng nhập
   - Chia sẻ quiz của bạn

### 📱 Responsive Design

UniQuizz hoạt động mượt mà trên:
- 💻 Desktop (Chrome, Firefox, Safari, Edge)
- 📱 Mobile (iOS Safari, Chrome Mobile)
- 📲 Tablet (iPad, Android Tablet)

### 🌓 Dark Mode

Toggle Dark Mode ở góc trên bên phải để bảo vệ mắt khi học đêm!

---

## 📖 Giới thiệu

**UniQuizz** là nền tảng học tập thông minh sử dụng AI (Google Gemini) để tự động tạo quiz, flashcard và cung cấp trợ lý học tập cá nhân hóa. Dự án được phát triển nhằm giúp sinh viên học tập hiệu quả hơn thông qua công nghệ AI tiên tiến.

### 🎯 Mục tiêu

- ✅ Tự động hóa việc tạo câu hỏi từ tài liệu học tập
- ✅ Cung cấp flashcard thông minh để ghi nhớ kiến thức
- ✅ Mentor AI tương tác giúp giải đáp thắc mắc
- ✅ Giao diện đẹp, dễ sử dụng với Dark Mode
- ✅ Chia sẻ và học tập cộng đồng

---

## ✨ Tính năng chính

### 🤖 AI-Powered Features

#### 1. **Tạo Quiz tự động**
- 📄 Upload file: **PDF, DOCX, PPTX**
- 🔗 Paste URL hoặc YouTube link
- 📝 Nhập text trực tiếp
- 🎯 Tùy chỉnh số lượng câu hỏi (1-50)
- 🧠 AI tạo câu hỏi chất lượng cao với giải thích chi tiết

#### 2. **Flashcard thông minh**
- 🗂️ Tạo flashcard từ tài liệu
- 💡 Gợi ý (hints) giúp ghi nhớ
- 🏷️ Phân loại theo tags
- 🔄 Chế độ học tập tương tác

#### 3. **Mentor AI - Miku**
- 👩‍🏫 Trợ lý AI với Live2D character
- 💬 Trả lời câu hỏi theo ngữ cảnh bài giảng
- 🎤 Text-to-Speech (TTS) với giọng nói tự nhiên
- 📚 Tạo bài giảng từ tài liệu

#### 4. **Học từ vựng**
- 🌍 Tạo bộ từ vựng theo chủ đề
- 🔊 Phát âm chuẩn
- 📖 Định nghĩa tiếng Việt + ví dụ tiếng Anh
- ➕ Thêm từ mới với AI suggestions

### 🎨 User Experience

- 🌓 **Dark Mode** - Bảo vệ mắt khi học đêm
- 📱 **Responsive Design** - Hoạt động mượt mà trên mọi thiết bị
- 🎭 **Animations** - Framer Motion cho trải nghiệm mượt mà
- 🎨 **Tet Theme** - Giao diện lấy cảm hứng từ Tết Việt Nam
- 🔍 **Search & Filter** - Tìm kiếm quiz/flashcard dễ dàng

### 🔐 Authentication & Security

- 🔑 JWT Authentication
- 👤 User profiles
- 🔒 Private/Public content control
- 📧 Email verification (optional)

### 🌐 Social Features

- 🔗 Chia sẻ quiz qua Facebook, Zalo, Telegram, Twitter
- 🌍 Public quiz gallery
- 👥 Community learning
- 📊 Leaderboard (coming soon)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 + Vite
- **Styling**: TailwindCSS 4.1
- **Animations**: Framer Motion
- **Routing**: React Router DOM 7
- **State Management**: React Hooks
- **Live2D**: pixi-live2d-display

### Backend
- **Runtime**: Node.js + Express 5
- **Database**: MongoDB 7 + Mongoose
- **AI**: Google Gemini 2.5 Flash
- **Authentication**: JWT + bcryptjs
- **File Processing**: 
  - PDF: pdf-parse
  - DOCX: mammoth
  - PPTX: jszip + xml2js
- **Web Scraping**: axios + cheerio
- **TTS**: Google Cloud Text-to-Speech

### DevOps
- **Deployment**: Vercel (Frontend + Backend)
- **Environment**: dotenv
- **Version Control**: Git

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- MongoDB >= 7.x
- npm hoặc yarn

### 1. Clone repository

```bash
git clone https://github.com/teehihi/UniQuizzHackathon.git

```

### 2. Cài đặt dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Cấu hình Environment Variables

#### Server (.env)
```env
# Server
PORT=5001

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/

# JWT
JWT_SECRET=your-secret-key-here

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-lite

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVICE=gmail

# Client URL
CLIENT_URL=http://localhost:5173
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5001
```

### 4. Chạy ứng dụng

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Truy cập: `http://localhost:5173`

#### Production Build

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

---

## 🚀 Hướng dẫn sử dụng

### 1. Đăng ký / Đăng nhập
- Truy cập trang chủ
- Click "Đăng ký" hoặc "Đăng nhập"
- Nhập thông tin và bắt đầu

### 2. Tạo Quiz

1. Click **"Tạo Quiz"** trên menu
2. Chọn nguồn nội dung:
   - 📄 **File**: Upload PDF, DOCX, PPTX
   - 🔗 **URL**: Paste link bài viết
   - 📺 **YouTube**: Paste link video
   - 📝 **Text**: Nhập/paste nội dung
3. Nhập tiêu đề và số câu hỏi
4. Click **"Tạo Quiz với AI"**
5. Đợi AI xử lý (10-30 giây)
6. Làm quiz hoặc chia sẻ với bạn bè!

### 3. Tạo Flashcard

1. Vào **"Flash Card"** → **"Tạo mới"**
2. Upload file hoặc nhập text
3. AI tự động tạo flashcard
4. Học với chế độ flip card

### 4. Học với Mentor AI

1. Vào **"Mentor"**
2. Upload tài liệu học
3. AI tạo bài giảng
4. Chat với Miku để hỏi đáp
5. Nghe giảng bài với TTS

### 5. Học từ vựng

1. Vào **"Tạo Quiz"** → **"Từ vựng"**
2. Chọn chủ đề hoặc tạo mới
3. AI tạo 10 từ vựng quan trọng
4. Học và luyện tập

---

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Quiz

#### Create Quiz
```http
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Quiz Title",
  "courseCode": "CS101",
  "questionCount": 10,
  "file": <file> | "url": <url> | "text": <text>
}
```

#### Get User Quizzes
```http
GET /api/decks
Authorization: Bearer {token}
```

#### Get Public Quiz
```http
GET /api/decks/public/:id
```

### Flashcard

#### Create Flashcard Set
```http
POST /api/flashcards/generate
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Flashcard Title",
  "count": 20,
  "file": <file> | "text": <text>
}
```

### Vocabulary

#### Generate Vocabulary
```http
POST /api/topics/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Technology"
}
```

### Search

#### Search All
```http
GET /api/search/all?q=python&type=quiz
```

---

## 🎨 Screenshots

<div align="center">

### 🏠 Trang chủ - Giao diện Tết ấm áp
<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTZkeTk3bXF4dDhjeXJxaG9jbHRhZTV0YndmcGVod3J5bjZodnBnNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wkYAQxsGPBvh14sT78/giphy.gif" alt="Home Page" width="800"/>

*Trang chủ với theme Tết Việt Nam, hiệu ứng hoa mai rơi và CTA rõ ràng*

---

### 📝 Quiz của tôi - Dark Mode
<img src="docs/screenshots/quiz.png" alt="My Quizzes" width="800"/>

*Quản lý quiz cá nhân với tính năng tìm kiếm, chia sẻ và dark mode*

---

### 📝 Thực hiện Quiz
<img src="docs/screenshots/quiz.webm" alt="Quizzes Handle" width="800"/>

*Giao diện Quiz sống động tạo cảm giác "muốn học"*

---

### 👩‍🏫 Mentor AI - Miku Live2D
<img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2N5aWdvbm9oaGhiaWNsbGRsdzhhMW5yNWNpMXd0MndpcmpzbHp1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4AbBlXLDxr5WeHZQq0/giphy.gif" alt="Mentor AI" width="800"/>

*Trợ lý AI Miku với Live2D character, chat thông minh và TTS*

---

### 🗂️ Flashcard - Học tập hiệu quả
<img src="docs/screenshots/flashcard.png" alt="Flashcard" width="800"/>
<img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYm85ajB6YjVxcTN0aTQ5bjFwc2xhMjB6MndqNnR3dTIyNDhsaXlrNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DVKnWXtryBCTLgQuZ9/giphy.gif" alt="Flashcard Learn" width="800"/>

*Tạo và học flashcard với giao diện thân thiện, hỗ trợ nhiều chủ đề*

</div>

---

## 🗺️ Roadmap

### Version 2.0 (Current)
- ✅ Multi-format file support (PDF, DOCX, PPTX)
- ✅ URL & YouTube content extraction
- ✅ Search functionality
- ✅ Dark mode
- ✅ Improved quiz quality with prompt engineering

### Version 2.1 (Planned)
- 🔄 Real-time collaboration
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app (React Native)
- 🔄 Gamification (badges, achievements)
- 🔄 AI-powered study recommendations

### Version 3.0 (Future)
- 🔮 Voice input for quiz creation
- 🔮 Image recognition (OCR)
- 🔮 Multi-language support
- 🔮 Integration with LMS platforms
- 🔮 Advanced AI tutoring

---

## 🤝 Contributing

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Coding Standards
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Test before submitting PR

---

## 🐛 Bug Reports

Nếu bạn phát hiện bug, vui lòng tạo issue với:
- Mô tả chi tiết bug
- Các bước tái hiện
- Screenshots (nếu có)
- Environment (OS, Browser, Node version)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Dự án được phát triển bởi nhóm 4 thành viên:

| Thành viên | GitHub |
|------------|--------|
| **[Phạm Công Trường]** | [@sai-ctruong](https://github.com/sai-ctruong) |
| **[Nguyễn Nhật Thiên]** | [@teehihi](https://github.com/teehihi) |
| **[Phạm Văn Hậu]** | [@vanhau123w-collab](https://github.com/vanhau123w-collab) |
| **[Trương Công Anh]** | [@coqanklazy](https://github.com/coqanklazy) |

### 🤝 Đóng góp

Tất cả thành viên đều tham gia vào các phần:

- **Frontend Development**: React, TailwindCSS, UI/UX Design, Animations
- **Backend Development**: Node.js, Express, MongoDB, RESTful API
- **AI Integration**: Google Gemini API, Prompt Engineering, Content Generation
- **Features**: Quiz, Flashcard, Mentor AI, Vocabulary, Search
- **DevOps**: Deployment, Testing, Bug Fixes, Optimization

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI API
- [React](https://reactjs.org/) - Frontend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Live2D](https://www.live2d.com/) - Character animation

---

## 📞 Contact

- **Email**: contact@uniquizz.com
- **Website**: https://uniquizzdom.vercel.app
- **GitHub**: [https://github.com/teehihi/UniQuizzHackathon](https://github.com/teehihi/UniQuizzHackathon)

---

<div align="center">

**Made with ❤️ in Vietnam**

⭐ Star this repo if you find it helpful!

</div>
