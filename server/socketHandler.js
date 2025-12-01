// socketHandler.js - SIMPLIFIED VERSION
const jwt = require('jsonwebtoken');
const Room = require('./models/Room');
const Deck = require('./models/Deck');

// Store để track connections
const roomConnections = new Map(); // roomCode -> Set of socketIds
const autoAdvanceLocks = new Map(); // roomCode -> timestamp

module.exports = (io) => {
  // Middleware xác thực
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (token && token !== 'guest') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
      } catch (error) {
        console.log('Invalid token, treating as guest');
      }
    }
    
    next();
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // LEAVE ROOM - XÓA PARTICIPANT KHỎI DATABASE
    socket.on('leave-room', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        if (!roomCode) {
          return callback?.({ error: 'Thiếu roomCode' });
        }

        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) {
          return callback?.({ success: true, message: 'Room not found' });
        }

        // Xóa participant dựa trên socketId
        const beforeCount = room.participants.length;
        room.participants = room.participants.filter(p => p.socketId !== socket.id);
        const afterCount = room.participants.length;

        if (beforeCount !== afterCount) {
          await room.save();
          
          // Broadcast update
          io.to(roomCode.toUpperCase()).emit('participants-updated', {
            participants: room.participants,
            count: room.participants.length
          });
          
          console.log(`🚪 Socket ${socket.id} left ${roomCode.toUpperCase()} (${beforeCount} → ${afterCount})`);
        }

        // Leave socket room
        socket.leave(roomCode.toUpperCase());
        
        // Cleanup tracking
        if (roomConnections.has(roomCode.toUpperCase())) {
          roomConnections.get(roomCode.toUpperCase()).delete(socket.id);
        }

        callback?.({ success: true });
      } catch (error) {
        console.error('Error leaving room:', error);
        callback?.({ error: error.message });
      }
    });

    // LEAVE ALL ROOMS
    socket.on('leave-all-rooms', () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          console.log(`🚪 Socket ${socket.id} left room ${room}`);
        }
      });
    });

    // CREATE ROOM
    socket.on('create-room', async (data, callback) => {
      try {
        const { quizId, mode, settings } = data;
        
        if (!socket.userId) {
          return callback({ error: 'Chỉ người dùng đã đăng nhập mới có thể tạo phòng' });
        }

        const quiz = await Deck.findOne({ _id: quizId, userId: socket.userId });
        if (!quiz) {
          return callback({ error: 'Không tìm thấy quiz hoặc bạn không có quyền' });
        }

        const roomCode = await Room.generateRoomCode();
        
        const room = new Room({
          roomCode,
          quizId,
          hostId: socket.userId,
          mode: mode || 'auto',
          settings: settings || {},
          participants: [] // Host KHÔNG nằm trong participants
        });

        await room.save();
        
        socket.join(roomCode);
        
        // Track connection
        if (!roomConnections.has(roomCode)) {
          roomConnections.set(roomCode, new Set());
        }
        roomConnections.get(roomCode).add(socket.id);

        callback({ success: true, roomCode, room });
        
        console.log(`🎮 Room created: ${roomCode} by ${socket.userId}`);
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ error: error.message });
      }
    });

    // JOIN ROOM - LOGIC ĐƠN GIẢN
    socket.on('join-room', async (data, callback) => {
      try {
        const { roomCode, displayName } = data;
        
        if (!roomCode || !displayName) {
          return callback({ error: 'Thiếu thông tin' });
        }

        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() }).populate('quizId');
        
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        if (room.status === 'finished') {
          return callback({ error: 'Phòng đã kết thúc' });
        }

        // Kiểm tra allowLateJoin setting
        if (room.status === 'playing' && !room.settings.allowLateJoin) {
          return callback({ error: 'Không thể tham gia khi game đang chơi' });
        }

        const isHost = socket.userId && socket.userId === room.hostId.toString();

        // Join socket room để nhận events
        socket.join(roomCode.toUpperCase());
        
        // Track connection
        if (!roomConnections.has(roomCode.toUpperCase())) {
          roomConnections.set(roomCode.toUpperCase(), new Set());
        }
        roomConnections.get(roomCode.toUpperCase()).add(socket.id);

        // Nếu là HOST, không thêm vào participants, chỉ join để nhận events
        if (isHost) {
          console.log(`👑 Host ${displayName} joined ${roomCode.toUpperCase()} (monitoring only)`);
          
          return callback({ 
            success: true, 
            room,
            quiz: room.quizId,
            isHost: true
          });
        }

        // Nếu là PLAYER, xóa participants cũ và thêm mới
        const uniqueKey = socket.userId || displayName;
        
        // BƯỚC 1: Xóa participants có socketId không còn active (cleanup)
        const beforeCleanup = room.participants.length;
        const activeSockets = Array.from(io.sockets.sockets.keys());
        room.participants = room.participants.filter(p => {
          // Giữ lại nếu socketId vẫn còn active
          if (p.socketId && activeSockets.includes(p.socketId)) {
            return true;
          }
          // Xóa nếu socketId không còn active
          console.log(`🧹 Cleanup: Removing inactive participant ${p.displayName} (socketId: ${p.socketId})`);
          return false;
        });

        // BƯỚC 2: Tìm TẤT CẢ participants cùng userId/displayName
        const beforeRemove = room.participants.length;
        const matchingParticipants = room.participants.filter(p => {
          const pKey = p.userId ? p.userId.toString() : p.displayName;
          return pKey === uniqueKey;
        });

        console.log(`🔍 Found ${matchingParticipants.length} matching participants for ${displayName}`);

        if (matchingParticipants.length > 0) {
          // Có participant cũ - REJOIN
          // Xóa TẤT CẢ participants cũ
          room.participants = room.participants.filter(p => {
            const pKey = p.userId ? p.userId.toString() : p.displayName;
            return pKey !== uniqueKey;
          });

          // Chọn participant có progress cao nhất để giữ lại
          const bestParticipant = matchingParticipants.reduce((best, current) => {
            return (current.score > best.score) ? current : best;
          });

          console.log(`🔄 Rejoin: ${displayName} - keeping best progress (${bestParticipant.answers.length} answers, ${bestParticipant.score} points)`);
          
          // Thêm lại với socketId mới
          room.participants.push({
            userId: bestParticipant.userId,
            displayName,
            isGuest: bestParticipant.isGuest,
            score: bestParticipant.score,
            answers: bestParticipant.answers,
            isOnline: true,
            socketId: socket.id
          });
        } else {
          // Không có participant cũ - NEW JOIN
          console.log(`➕ New join: ${displayName}`);
          room.participants.push({
            userId: socket.userId || null,
            displayName,
            isGuest: !socket.userId,
            score: 0,
            answers: [],
            isOnline: true,
            socketId: socket.id
          });
        }
        
        console.log(`📊 Cleanup stats: ${beforeCleanup} → ${beforeRemove} (inactive) → ${room.participants.length} (final)`);
        
        await room.save();

        callback({ 
          success: true, 
          room,
          quiz: room.quizId,
          isHost: false
        });

        // Broadcast to ALL in room (including host)
        io.to(roomCode.toUpperCase()).emit('participants-updated', {
          participants: room.participants,
          count: room.participants.length
        });

        console.log(`👤 ${displayName} joined ${roomCode.toUpperCase()} (Total: ${room.participants.length})`);
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ error: error.message });
      }
    });

    // SUBMIT ANSWER
    socket.on('submit-answer', async (data, callback) => {
      try {
        const { roomCode, questionIndex, answer, timeSpent } = data;
        
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        // Tìm participant dựa trên socketId (chính xác nhất)
        const participant = room.participants.find(p => p.socketId === socket.id);

        if (!participant) {
          console.error(`❌ Participant not found for socket ${socket.id}`);
          console.log('Available participants:', room.participants.map(p => ({ 
            displayName: p.displayName, 
            socketId: p.socketId 
          })));
          return callback({ error: 'Không tìm thấy người chơi' });
        }

        const alreadyAnswered = participant.answers.find(a => a.questionIndex === questionIndex);
        if (alreadyAnswered) {
          return callback({ error: 'Đã trả lời câu này rồi' });
        }

        const question = room.quizId.questions[questionIndex];
        const isCorrect = answer === question.answer;

        let points = 0;
        if (isCorrect) {
          const maxTime = room.settings.timePerQuestion * 1000;
          const timeBonus = Math.max(0, (maxTime - timeSpent) / maxTime);
          points = Math.round(1000 + (timeBonus * 500));
        }

        participant.answers.push({
          questionIndex,
          answer,
          isCorrect,
          answeredAt: new Date(),
          timeSpent
        });

        participant.score += points;
        await room.save();

        callback({ 
          success: true, 
          isCorrect, 
          points,
          correctAnswer: question.answer
        });

        const answeredCount = room.participants.filter(p =>
          p.answers.some(a => a.questionIndex === questionIndex)
        ).length;

        io.to(roomCode).emit('answer-submitted', {
          participantName: participant.displayName,
          answeredCount,
          totalParticipants: room.participants.length
        });

        console.log(`✅ ${participant.displayName} answered Q${questionIndex}: ${isCorrect ? 'correct' : 'wrong'} (+${points})`);
      } catch (error) {
        console.error('Error submitting answer:', error);
        callback({ error: error.message });
      }
    });

    // AUTO NEXT QUESTION
    socket.on('auto-next-question', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        // Lock để tránh duplicate
        const now = Date.now();
        const lastAdvance = autoAdvanceLocks.get(roomCode);
        
        if (lastAdvance && (now - lastAdvance) < 2000) {
          if (callback) callback({ success: true, ignored: true });
          return;
        }
        
        autoAdvanceLocks.set(roomCode, now);
        
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room || room.mode !== 'auto') {
          autoAdvanceLocks.delete(roomCode);
          if (callback) callback({ error: 'Phòng không hợp lệ' });
          return;
        }

        room.currentQuestionIndex++;
        
        if (room.currentQuestionIndex >= room.quizId.questions.length) {
          room.status = 'finished';
          room.finishedAt = new Date();
        }

        await room.save();

        io.to(roomCode).emit('question-changed', {
          questionIndex: room.currentQuestionIndex,
          isFinished: room.status === 'finished'
        });

        if (callback) callback({ success: true });
        
        console.log(`⏩ Auto: ${roomCode} → Q${room.currentQuestionIndex}`);
        
        setTimeout(() => autoAdvanceLocks.delete(roomCode), 3000);
        
      } catch (error) {
        console.error('Error auto next:', error);
        autoAdvanceLocks.delete(data.roomCode);
        if (callback) callback({ error: error.message });
      }
    });

    // NEXT QUESTION (Manual)
    socket.on('next-question', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        if (room.hostId.toString() !== socket.userId) {
          return callback({ error: 'Chỉ host mới có thể chuyển câu' });
        }

        room.currentQuestionIndex++;
        
        if (room.currentQuestionIndex >= room.quizId.questions.length) {
          room.status = 'finished';
          room.finishedAt = new Date();
        }

        await room.save();

        io.to(roomCode).emit('question-changed', {
          questionIndex: room.currentQuestionIndex,
          isFinished: room.status === 'finished'
        });

        callback({ success: true });
        
        console.log(`➡️ Manual: ${roomCode} → Q${room.currentQuestionIndex}`);
      } catch (error) {
        console.error('Error next question:', error);
        callback({ error: error.message });
      }
    });

    // START GAME
    socket.on('start-game', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        const room = await Room.findOne({ roomCode });
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        if (room.hostId.toString() !== socket.userId) {
          return callback({ error: 'Chỉ host mới có thể bắt đầu' });
        }

        room.status = 'playing';
        room.startedAt = new Date();
        await room.save();

        io.to(roomCode).emit('game-started', {
          startedAt: room.startedAt
        });

        callback({ success: true });
        
        console.log(`🎮 Game started: ${roomCode}`);
      } catch (error) {
        console.error('Error starting game:', error);
        callback({ error: error.message });
      }
    });

    // END GAME
    socket.on('end-game', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        const room = await Room.findOne({ roomCode });
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        if (room.hostId.toString() !== socket.userId) {
          return callback({ error: 'Chỉ host mới có thể kết thúc' });
        }

        room.status = 'finished';
        room.finishedAt = new Date();
        await room.save();

        const leaderboard = room.participants
          .map(p => ({
            displayName: p.displayName,
            score: p.score,
            correctAnswers: p.answers.filter(a => a.isCorrect).length,
            totalAnswers: p.answers.length
          }))
          .sort((a, b) => b.score - a.score);

        io.to(roomCode).emit('game-ended', {
          leaderboard,
          finishedAt: room.finishedAt
        });

        callback({ success: true });
        
        console.log(`🏁 Game ended: ${roomCode}`);
      } catch (error) {
        console.error('Error ending game:', error);
        callback({ error: error.message });
      }
    });

    // GET LEADERBOARD
    socket.on('get-leaderboard', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        const room = await Room.findOne({ roomCode });
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        const leaderboard = room.participants
          .map(p => ({
            displayName: p.displayName,
            score: p.score,
            correctAnswers: p.answers.filter(a => a.isCorrect).length,
            totalAnswers: p.answers.length,
            isOnline: p.isOnline
          }))
          .sort((a, b) => b.score - a.score);

        callback({ success: true, leaderboard });
      } catch (error) {
        console.error('Error getting leaderboard:', error);
        callback({ error: error.message });
      }
    });

    // GET ROOM DATA
    socket.on('get-room-data', async (data, callback) => {
      try {
        const { roomCode } = data;
        
        const room = await Room.findOne({ roomCode }).populate('quizId');
        if (!room) {
          return callback({ error: 'Không tìm thấy phòng' });
        }

        callback({ 
          success: true, 
          room,
          quiz: room.quizId
        });
      } catch (error) {
        console.error('Error getting room data:', error);
        callback({ error: error.message });
      }
    });

    // DISCONNECT - XÓA PARTICIPANT DỰA TRÊN SOCKETID
    socket.on('disconnect', async () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      
      try {
        // Tìm tất cả rooms mà socket này đang ở
        const rooms = Array.from(socket.rooms);
        
        for (const roomCode of rooms) {
          if (roomCode === socket.id) continue; // Skip socket's own room
          
          const room = await Room.findOne({ roomCode });
          if (!room) continue;

          // Xóa participant dựa trên socketId
          const beforeCount = room.participants.length;
          
          room.participants = room.participants.filter(p => {
            // Xóa nếu socketId match
            return p.socketId !== socket.id;
          });

          const afterCount = room.participants.length;
          
          if (beforeCount !== afterCount) {
            await room.save();
            
            // Broadcast update to ALL (including host)
            io.to(roomCode).emit('participants-updated', {
              participants: room.participants,
              count: room.participants.length
            });
            
            console.log(`🚪 Removed participant from ${roomCode} (${beforeCount} → ${afterCount})`);
          }

          // Cleanup tracking
          if (roomConnections.has(roomCode)) {
            roomConnections.get(roomCode).delete(socket.id);
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};

// Cleanup job
setInterval(async () => {
  try {
    const Room = require('./models/Room');
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const result = await Room.deleteMany({
      $or: [
        { status: 'finished', finishedAt: { $lt: thirtyMinutesAgo } },
        { createdAt: { $lt: thirtyMinutesAgo }, participants: { $size: 0 } }
      ]
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleanup: Deleted ${result.deletedCount} old rooms`);
    }
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
}, 30 * 60 * 1000);
