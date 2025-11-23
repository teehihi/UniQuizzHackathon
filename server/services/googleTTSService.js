const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

// Khởi tạo client
let client;

try {
  // Kiểm tra credentials file
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                         path.join(__dirname, '../config/google-tts-credentials.json');
  
  if (fs.existsSync(credentialsPath)) {
    client = new textToSpeech.TextToSpeechClient({
      keyFilename: credentialsPath
    });
    console.log('✅ Google Cloud TTS initialized successfully');
  } else {
    console.warn('⚠️ Google Cloud TTS credentials not found. Using fallback TTS.');
    client = null;
  }
} catch (error) {
  console.error('❌ Error initializing Google Cloud TTS:', error.message);
  client = null;
}

/**
 * Synthesize speech với Google Cloud TTS
 * @param {string} text - Text cần đọc
 * @param {object} options - Cấu hình giọng đọc
 * @returns {Buffer} - Audio buffer
 */
async function synthesizeSpeech(text, options = {}) {
  if (!client) {
    throw new Error('Google Cloud TTS not initialized. Please check credentials.');
  }

  const {
    language = 'vi-VN',
    gender = 'FEMALE', // MALE, FEMALE, NEUTRAL
    voiceName = null, // Tên giọng cụ thể
    rate = 1.0, // 0.25 - 4.0
    pitch = 0.0, // -20.0 - 20.0
    volume = 0.0, // -96.0 - 16.0 (dB)
  } = options;

  // Chọn giọng tự động nếu không chỉ định
  const selectedVoice = voiceName || getRecommendedVoice(language, gender);

  const request = {
    input: { text },
    voice: {
      languageCode: language,
      name: selectedVoice,
      ssmlGender: gender,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: rate,
      pitch: pitch,
      volumeGainDb: volume,
      // Thêm effects để giọng tự nhiên hơn
      effectsProfileId: ['headphone-class-device'],
    },
  };

  try {
    console.log(`🎤 Synthesizing speech with voice: ${selectedVoice}`);
    const [response] = await client.synthesizeSpeech(request);
    console.log(`✅ Speech synthesized: ${response.audioContent.length} bytes`);
    return response.audioContent;
  } catch (error) {
    console.error('❌ Google Cloud TTS Error:', error);
    throw error;
  }
}

/**
 * Lấy danh sách giọng đọc có sẵn
 */
async function listVoices(languageCode = 'vi-VN') {
  if (!client) {
    throw new Error('Google Cloud TTS not initialized');
  }

  try {
    const [result] = await client.listVoices({ languageCode });
    console.log(`📋 Found ${result.voices.length} voices for ${languageCode}`);
    return result.voices;
  } catch (error) {
    console.error('❌ Error listing voices:', error);
    throw error;
  }
}

/**
 * Gợi ý giọng đọc tốt nhất
 */
function getRecommendedVoice(language, gender) {
  const recommendations = {
    'vi-VN': {
      FEMALE: 'vi-VN-Wavenet-A', // Giọng nữ WaveNet (tự nhiên nhất)
      MALE: 'vi-VN-Wavenet-B',   // Giọng nam WaveNet
      NEUTRAL: 'vi-VN-Wavenet-C',
    },
    'en-US': {
      FEMALE: 'en-US-Neural2-F', // Giọng nữ Neural2
      MALE: 'en-US-Neural2-D',   // Giọng nam Neural2
      NEUTRAL: 'en-US-Neural2-A',
    },
  };

  return recommendations[language]?.[gender] || `${language}-Standard-A`;
}

/**
 * Kiểm tra xem Google Cloud TTS có sẵn không
 */
function isAvailable() {
  return client !== null;
}

module.exports = {
  synthesizeSpeech,
  listVoices,
  getRecommendedVoice,
  isAvailable,
};
