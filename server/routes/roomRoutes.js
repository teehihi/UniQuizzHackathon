// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Deck = require('../models/Deck');
const jwt = require('jsonwebtoken');

// Middleware xác thực
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// GET room info (public - không cần auth)
router.get('/:roomCode', async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() })
      .populate('quizId')
      .populate('hostId', 'email fullName');
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// GET leaderboard of a room (được lưu trữ trong 15 ngày)
router.get('/:roomCode/leaderboard', async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const RoomLeaderboard = require('../models/RoomLeaderboard');

    // 1. Thử lấy từ collection RoomLeaderboard (TTL 15 ngày)
    let doc = await RoomLeaderboard.findOne({ roomCode }).sort({ createdAt: -1 });

    if (!doc) {
      // 2. Fallback sang Room document
      const room = await Room.findOne({ roomCode }).populate('quizId', 'title');
      if (room) {
        // Kiểm tra xem bảng xếp hạng trong room đã quá 15 ngày chưa
        if (room.leaderboardExpiresAt && new Date() > room.leaderboardExpiresAt) {
          return res.status(404).json({ message: 'Bảng xếp hạng của phòng này đã hết hạn 15 ngày.' });
        }
        if (room.finalLeaderboard && room.finalLeaderboard.length > 0) {
          return res.json({
            roomCode,
            quizTitle: room.quizId?.title || '',
            rankings: room.finalLeaderboard,
            finishedAt: room.finishedAt,
            expiresAt: room.leaderboardExpiresAt
          });
        }
      }
      return res.status(404).json({ message: 'Chưa có bảng xếp hạng cho phòng này hoặc đã hết hạn 15 ngày.' });
    }

    res.json({
      roomCode: doc.roomCode,
      quizTitle: doc.quizTitle,
      rankings: doc.rankings,
      finishedAt: doc.finishedAt,
      createdAt: doc.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// GET my rooms (cần auth)
router.get('/my/rooms', verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find({ hostId: req.userId })
      .populate('quizId', 'title courseCode')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// DELETE room (chỉ host) - TRIỆT ĐỂ
router.delete('/:roomCode', verifyToken, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    
    const room = await Room.findOne({ 
      roomCode,
      hostId: req.userId 
    });

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng hoặc bạn không có quyền' });
    }

    const io = req.app.get('io');
    let socketsInRoom = [];
    if (io) {
      // 1. Emit event để kick tất cả người chơi
      io.to(roomCode).emit('room-deleted');
      
      // 2. Force disconnect và cleanup TẤT CẢ sockets trong room
      socketsInRoom = await io.in(roomCode).fetchSockets();
      for (const socket of socketsInRoom) {
        console.log(`🚪 Force cleaning socket ${socket.id} from room ${roomCode}`);
        
        // Leave room
        socket.leave(roomCode);
        
        // Remove all listeners
        socket.removeAllListeners();
        
        // Force disconnect
        socket.disconnect(true);
      }
      
      console.log(`🗑️ Deleted room ${roomCode} and force disconnected ${socketsInRoom.length} sockets`);
    }

    // 3. Xóa room khỏi database
    await Room.findByIdAndDelete(room._id);
    
    res.json({ 
      message: 'Đã xóa phòng thành công',
      disconnectedSockets: socketsInRoom?.length || 0
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// RESET participants (for testing - chỉ host)
router.post('/:roomCode/reset-participants', verifyToken, async (req, res) => {
  try {
    const room = await Room.findOne({ 
      roomCode: req.params.roomCode.toUpperCase(),
      hostId: req.userId 
    });

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng hoặc bạn không có quyền' });
    }

    // Giữ lại host, xóa các participant khác
    room.participants = room.participants.filter(p => 
      p.userId && p.userId.toString() === req.userId
    );
    
    await room.save();
    
    res.json({ message: 'Đã reset danh sách người chơi', room });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});



// GET all rooms (for debugging)
router.get('/debug/all', verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find({})
      .populate('hostId', 'email fullName')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      count: rooms.length,
      rooms: rooms.map(r => ({
        roomCode: r.roomCode,
        quiz: r.quizId?.title,
        host: r.hostId?.email,
        status: r.status,
        participantCount: r.participants.length,
        onlineCount: r.participants.filter(p => p.isOnline).length,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

// CLEANUP DUPLICATE PARTICIPANTS - Xóa participants trùng lặp trong một room
router.post('/:roomCode/cleanup-duplicates', async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    const beforeCount = room.participants.length;
    const uniqueParticipants = new Map();

    // Lọc participants, giữ lại cái có score cao nhất cho mỗi userId/displayName
    room.participants.forEach(p => {
      const key = p.userId ? p.userId.toString() : p.displayName;
      const existing = uniqueParticipants.get(key);
      
      if (!existing || p.score > existing.score) {
        uniqueParticipants.set(key, p);
      }
    });

    room.participants = Array.from(uniqueParticipants.values());
    await room.save();

    const afterCount = room.participants.length;
    const removedCount = beforeCount - afterCount;

    // Broadcast update
    const io = req.app.get('io');
    if (io) {
      io.to(roomCode.toUpperCase()).emit('participants-updated', {
        participants: room.participants,
        count: room.participants.length
      });
    }

    res.json({ 
      message: `Đã xóa ${removedCount} participants trùng lặp`,
      before: beforeCount,
      after: afterCount,
      removed: removedCount,
      participants: room.participants.map(p => ({
        displayName: p.displayName,
        score: p.score,
        answers: p.answers.length
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;
