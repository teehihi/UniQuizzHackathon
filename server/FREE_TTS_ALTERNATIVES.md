# 🎤 Giải pháp TTS Miễn phí (Không cần billing)

## ✅ HIỆN TẠI: Google Translate TTS (Đang dùng)

Hệ thống hiện tại đã sử dụng **Google Translate TTS** - hoàn toàn miễn phí, không cần API key!

### **Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Không cần đăng ký
- ✅ Không cần billing
- ✅ Hỗ trợ tiếng Việt
- ✅ Đang hoạt động tốt

### **Nhược điểm:**
- ⚠️ Giọng đọc cơ bản (robot)
- ⚠️ Không có cảm xúc
- ⚠️ Chất lượng thấp hơn WaveNet

### **Kết luận:**
**→ Đủ dùng cho production! Không cần thay đổi gì.**

---

## 🎯 GIẢI PHÁP MIỄN PHÍ KHÁC

### **1. Web Speech API (Browser Built-in)** ⭐ Khuyến nghị

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Built-in browser (Chrome, Edge, Safari)
- ✅ Không cần server
- ✅ Giọng đọc tốt hơn Google Translate
- ✅ Hỗ trợ nhiều giọng

**Nhược điểm:**
- ⚠️ Chỉ chạy trên browser (không offline)
- ⚠️ Khác nhau giữa các browser

**Implementation:**

```javascript
// client/src/pages/MentorPage.jsx

const speakWithWebSpeech = (text, onEnd) => {
  // Check browser support
  if (!('speechSynthesis' in window)) {
    console.error('Browser không hỗ trợ Web Speech API');
    return;
  }

  // Stop any current speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure
  utterance.lang = 'vi-VN'; // Tiếng Việt
  utterance.rate = ttsConfig.rate; // 0.1 - 10
  utterance.pitch = ttsConfig.pitch || 1; // 0 - 2
  utterance.volume = ttsConfig.volume; // 0 - 1

  // Get Vietnamese voices
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(voice => voice.lang.startsWith('vi'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  // Events
  utterance.onstart = () => {
    if (live2dRef.current) {
      live2dRef.current.startSpeaking();
    }
  };

  utterance.onend = () => {
    if (live2dRef.current) {
      live2dRef.current.stopSpeaking();
    }
    if (onEnd) onEnd();
  };

  utterance.onerror = (error) => {
    console.error('Speech error:', error);
    if (live2dRef.current) {
      live2dRef.current.stopSpeaking();
    }
  };

  // Speak
  window.speechSynthesis.speak(utterance);
};
```

**Cách dùng:**
```javascript
// Thay thế speakText bằng speakWithWebSpeech
speakWithWebSpeech("Xin chào, tôi là Miku Mentor", () => {
  console.log("Done!");
});
```

---

### **2. Microsoft Edge TTS (Miễn phí)** ⭐⭐

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Giọng đọc rất tự nhiên (Neural voices)
- ✅ Hỗ trợ tiếng Việt tốt
- ✅ Không cần API key

**Nhược điểm:**
- ⚠️ Cần cài package `edge-tts`
- ⚠️ Chạy trên server

**Installation:**
```bash
cd server
npm install edge-tts
```

**Implementation:**

```javascript
// server/services/edgeTTSService.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

async function synthesizeWithEdgeTTS(text, options = {}) {
  const {
    voice = 'vi-VN-HoaiMyNeural', // Giọng nữ Việt Nam
    rate = '+0%', // -50% to +100%
    pitch = '+0Hz', // -50Hz to +50Hz
  } = options;

  // Tạo file tạm
  const tempFile = path.join(__dirname, '../temp', `tts_${Date.now()}.mp3`);
  
  // Ensure temp directory exists
  const tempDir = path.dirname(tempFile);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Run edge-tts command
    const command = `edge-tts --voice "${voice}" --rate="${rate}" --pitch="${pitch}" --text "${text.replace(/"/g, '\\"')}" --write-media "${tempFile}"`;
    
    await execPromise(command);

    // Read file
    const audioBuffer = fs.readFileSync(tempFile);

    // Delete temp file
    fs.unlinkSync(tempFile);

    return audioBuffer;
  } catch (error) {
    console.error('Edge TTS Error:', error);
    throw error;
  }
}

// Danh sách giọng Việt Nam
const VIETNAMESE_VOICES = [
  'vi-VN-HoaiMyNeural', // Nữ (Khuyến nghị)
  'vi-VN-NamMinhNeural', // Nam
];

module.exports = {
  synthesizeWithEdgeTTS,
  VIETNAMESE_VOICES,
};
```

**API Route:**
```javascript
// server/apiRoutes.js
const edgeTTSService = require('./services/edgeTTSService');

router.post('/mentor/tts/edge-synthesize', verifyToken, async (req, res) => {
  try {
    const { text, options } = req.body;

    const audioBuffer = await edgeTTSService.synthesizeWithEdgeTTS(text, options);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('Edge TTS Error:', error);
    res.status(500).json({ message: 'Lỗi TTS', error: error.message });
  }
});
```

---

### **3. Coqui TTS (Open Source)** ⭐⭐⭐

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Open source
- ✅ Chất lượng cao
- ✅ Chạy local (không cần internet)

**Nhược điểm:**
- ⚠️ Cần cài Python
- ⚠️ Cần download models (~500MB)
- ⚠️ Tốn tài nguyên server

**Installation:**
```bash
pip install TTS
```

**Usage:**
```bash
# Synthesize
tts --text "Xin chào" --model_name "tts_models/vi/vivos/vits" --out_path output.wav
```

---

### **4. gTTS (Google Text-to-Speech Python)** ⭐

**Ưu điểm:**
- ✅ Miễn phí
- ✅ Dễ cài đặt
- ✅ Hỗ trợ tiếng Việt

**Nhược điểm:**
- ⚠️ Cần Python
- ⚠️ Giọng đọc cơ bản

**Installation:**
```bash
pip install gTTS
```

**Usage:**
```python
from gtts import gTTS

tts = gTTS(text='Xin chào', lang='vi')
tts.save('output.mp3')
```

---

## 🎯 KHUYẾN NGHỊ

### **Cho UniQuizz:**

**Option 1: Giữ nguyên (Google Translate TTS)** ✅ Khuyến nghị
- Đang hoạt động tốt
- Không cần thay đổi gì
- Miễn phí 100%

**Option 2: Thêm Web Speech API** ⭐⭐
- Giọng đọc tốt hơn
- Chạy trên browser
- Dễ implement
- Miễn phí 100%

**Option 3: Thêm Edge TTS** ⭐⭐⭐
- Giọng đọc rất tự nhiên
- Miễn phí 100%
- Cần cài package

---

## 📝 IMPLEMENTATION PLAN

### **Nếu muốn thêm Web Speech API:**

1. **Update MentorPage.jsx:**
```javascript
// Thêm option chọn TTS engine
const [ttsEngine, setTtsEngine] = useState('google-translate'); // hoặc 'web-speech'

// Trong Voice Settings
<select value={ttsEngine} onChange={(e) => setTtsEngine(e.target.value)}>
  <option value="google-translate">Google Translate (Server)</option>
  <option value="web-speech">Web Speech API (Browser)</option>
</select>

// Trong speakText
if (ttsEngine === 'web-speech') {
  speakWithWebSpeech(text, onEnd);
} else {
  // Existing Google Translate TTS
}
```

2. **Test:**
- Chọn "Web Speech API"
- Click "Bắt đầu giảng"
- Nghe giọng đọc

---

## 🎉 KẾT LUẬN

**Bạn KHÔNG CẦN Google Cloud API!**

Hệ thống hiện tại với **Google Translate TTS** đã:
- ✅ Hoạt động tốt
- ✅ Miễn phí 100%
- ✅ Không cần billing
- ✅ Không cần API key
- ✅ Hỗ trợ tiếng Việt

**Nếu muốn giọng đọc tốt hơn:**
- → Thêm **Web Speech API** (5 phút)
- → Hoặc **Edge TTS** (15 phút)

**Cả 2 đều miễn phí 100%!** 🎤✨

---

## 🚀 QUICK START - WEB SPEECH API

Muốn thử ngay? Copy code này:

```javascript
// Test Web Speech API
const testWebSpeech = () => {
  const utterance = new SpeechSynthesisUtterance("Xin chào, tôi là Miku Mentor");
  utterance.lang = 'vi-VN';
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
};

// Gọi trong console
testWebSpeech();
```

**Nghe thử ngay trong browser!** 🎧
