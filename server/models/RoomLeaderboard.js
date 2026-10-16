// models/RoomLeaderboard.js
const mongoose = require('mongoose');

const RoomLeaderboardSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  quizTitle: {
    type: String,
    default: ''
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rankings: [{
    rank: Number,
    displayName: String,
    score: Number,
    correctAnswers: Number,
    totalAnswers: Number,
    characterConfig: Object
  }],
  finishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 15 * 24 * 60 * 60 // Tự động xóa sau 15 ngày qua MongoDB TTL Index
  }
});

module.exports = mongoose.model('RoomLeaderboard', RoomLeaderboardSchema);
