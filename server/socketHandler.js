// socketHandler.js - SIMPLIFIED VERSION
const jwt = require('jsonwebtoken');
const Room = require('./models/Room');
const Deck = require('./models/Deck');
const RoomLeaderboard = require('./models/RoomLeaderboard');

// Store để track connections
const roomConnections = new Map(); // roomCode -> Set of socketIds
const autoAdvanceLocks = new Map(); // roomCode -> timestamp

// Helper to handle Mongoose VersionError with retry by re-fetching and re-applying logic
const executeRoomTransaction = async (roomCode, transactionFn) => {
  let retries = 5;
  while (retries > 0) {
    try {
      // 1. Fetch Fresh Room
      const room = await Room.findOne({ roomCode: roomCode.toUpperCase() }).populate('quizId');
      if (!room) return { error: 'Room not found' };

      // 2. Run Transaction Logic (Mutate Room)
      const result = await transactionFn(room);
      
      // Allow transaction to cancel saving
      if (result && result.cancel) {
        return { success: false, ...result };
      }

      // 3. Attempt Save
      await room.save();
      return { success: true, room, data: result };

    } catch (err) {
      if (err.name === 'VersionError' && retries > 1) {
        console.warn(`⚠️ Race condition on ${roomCode}. Retrying transaction... (${retries} left)`);
        retries--;
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200)); // Random backoff
        continue;
      }
      console.error('Transaction failed:', err);
      throw err;
    }
  }
  throw new Error('Server busy: Too many concurrent updates');
};

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

        // Nếu phòng đang chờ ('waiting'): xóa khỏi danh sách participants để không chiếm slot sảnh
        // Nếu phòng đang chơi hoặc đã kết thúc: GIỮ NGUYÊN điểm số, chỉ đánh dấu offline
        const beforeCount = room.participants.length;
        if (room.status === 'waiting') {
          room.participants = room.participants.filter(p => p.socketId !== socket.id);
        } else {
          const participant = room.participants.find(p => p.socketId === socket.id);
          if (participant) {
            participant.isOnline = false;
            participant.socketId = null;
          }
        }
        const afterCount = room.participants.filter(p => p.isOnline !== false).length;

        await room.save();
        
        // Broadcast update
        io.to(roomCode.toUpperCase()).emit('participants-updated', {
          participants: room.participants,
          count: room.participants.length
        });
        
        console.log(`🚪 Socket ${socket.id} left ${roomCode.toUpperCase()} (status: ${room.status})`);

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
        
        console.log('🎮 [CREATE-ROOM] Received data:', { quizId, mode, settings });
        
        if (!socket.userId) {
          return callback({ error: 'Chỉ người dùng đã đăng nhập mới có thể tạo phòng' });
        }

        const quiz = await Deck.findOne({ _id: quizId, userId: socket.userId });
        if (!quiz) {
          return callback({ error: 'Không tìm thấy quiz hoặc bạn không có quyền' });
        }

        const roomCode = await Room.generateRoomCode();
        
        const finalMode = mode || 'auto';
        console.log('🎮 [CREATE-ROOM] Mode value - received:', mode, 'final:', finalMode);
        
        const room = new Room({
          roomCode,
          quizId,
          hostId: socket.userId,
          mode: finalMode,
          settings: settings || {},
          participants: [] // Host KHÔNG nằm trong participants
        });

        await room.save();
        
        console.log('🎮 [CREATE-ROOM] Room saved to DB:', {
          roomCode,
          mode: room.mode,
          status: room.status
        });
        
        socket.join(roomCode);
        
        // Track connection
        if (!roomConnections.has(roomCode)) {
          roomConnections.set(roomCode, new Set());
        }
        roomConnections.get(roomCode).add(socket.id);

        callback({ success: true, roomCode, room });
        
        console.log(`🎮 Room created: ${roomCode} by ${socket.userId} with mode=${room.mode}`);
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ error: error.message });
      }
    });

    // JOIN ROOM - LOGIC ĐƠN GIẢN
    socket.on('join-room', async (data, callback) => {
      try {
        const { roomCode, displayName, characterConfig } = data;
        
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

        // Use helper with retry (all join logic moved inside transaction to be safe)
        const result = await executeRoomTransaction(roomCode, async (room) => {
          // BƯỚC 1: Xóa participants có socketId không còn active (cleanup)
          const activeSockets = Array.from(io.sockets.sockets.keys());
          room.participants = room.participants.filter(p => {
             // Giữ lại nếu socketId vẫn còn active HOẶC là chính user đang connect lại
             if (p.socketId && (activeSockets.includes(p.socketId) || p.socketId === socket.id)) {
               return true;
             }
             return false;
          });

          // BƯỚC 2: Tìm TẤT CẢ participants cùng userId/displayName
          const uniqueKey = socket.userId || displayName;
          const matchingParticipants = room.participants.filter(p => {
            const pKey = p.userId ? p.userId.toString() : p.displayName;
            return pKey === uniqueKey;
          });

          if (matchingParticipants.length > 0) {
            // Có participant cũ - REJOIN
            // Xóa TẤT CẢ participants cũ của user này
            room.participants = room.participants.filter(p => {
              const pKey = p.userId ? p.userId.toString() : p.displayName;
              return pKey !== uniqueKey;
            });

            // Chọn participant có progress cao nhất để giữ lại
            const bestParticipant = matchingParticipants.reduce((best, current) => {
              return (current.score > best.score) ? current : best;
            }, matchingParticipants[0]);
            
            // Thêm lại với socketId mới
            room.participants.push({
              userId: bestParticipant.userId,
              displayName,
              isGuest: bestParticipant.isGuest,
              score: bestParticipant.score,
              answers: bestParticipant.answers,
              isOnline: true,
              socketId: socket.id,
              characterConfig: bestParticipant.characterConfig || characterConfig || {}
            });
            console.log(`🔄 Rejoin: ${displayName}`);
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
              socketId: socket.id,
              characterConfig: characterConfig || {}
            });
          }
        });

        if (!result.success) {
           throw new Error('Could not join room due to high load, please try again');
        }

        const savedRoom = result.room;

        callback({ 
          success: true, 
          room: savedRoom,
          quiz: savedRoom.quizId,
          isHost: false
        });

        // Broadcast to ALL in room (including host)
        io.to(roomCode.toUpperCase()).emit('participants-updated', {
          participants: savedRoom.participants,
          count: savedRoom.participants.length
        });
        
        // Broadcast join notification
        io.to(roomCode.toUpperCase()).emit('participant-joined', { displayName });
        
        console.log(`👤 ${displayName} joined ${roomCode.toUpperCase()} (Total: ${savedRoom.participants.length})`);

        console.log(`👤 ${displayName} joined ${roomCode.toUpperCase()} (Total: ${room.participants.length})`);
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ error: error.message });
      }
    });

    // UPDATE CHARACTER CONFIG - FIXED WITH TRANSACTION
    socket.on('update-character', async (data, callback) => {
      try {
        const { roomCode, characterConfig } = data;
        
        const result = await executeRoomTransaction(roomCode, async (room) => {
             const participant = room.participants.find(p => p.socketId === socket.id);
             
             // If host (not in participants), just acknowledge
             if (!participant) {
                // If not participant, maybe host? Return success but don't save
                return { cancel: true, success: true, message: 'Host updated (no-op)' };
             }

             participant.characterConfig = characterConfig;
        });

        if (!result.success && !result.cancel) {
             throw new Error('Failed to update character configuration');
        }

        // Broadcast to everyone (result.room contains the saved room)
        const room = result.room || (await Room.findOne({ roomCode: roomCode.toUpperCase() }));
        if (room) {
            io.to(roomCode.toUpperCase()).emit('participants-updated', {
              participants: room.participants,
              count: room.participants.length
            });
        }

        if (callback) callback({ success: true });
        
      } catch (error) {
        console.error('Error updating character:', error);
        if (callback) callback({ error: error.message });
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

        const currentLeaderboard = room.participants
          .map(p => ({
            displayName: p.displayName,
            score: p.score,
            correctAnswers: p.answers.filter(a => a.isCorrect).length,
            totalAnswers: p.answers.length,
            isOnline: p.isOnline,
            socketId: p.socketId,
            characterConfig: p.characterConfig
          }))
          .sort((a, b) => b.score - a.score)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));

        io.to(roomCode).emit('answer-submitted', {
          participantName: participant.displayName,
          answeredCount,
          totalParticipants: room.participants.length,
          leaderboard: currentLeaderboard
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
          console.warn(`⚠️ Auto-advance failed: Room=${roomCode}, Mode=${room?.mode}, Found=${!!room}`);
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
        console.log(`✅ Auto-advance SAVED: Room=${roomCode}, Mode=${room.mode}, Q=${room.currentQuestionIndex}`);

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

        const initialLeaderboard = room.participants
          .map(p => ({
            displayName: p.displayName,
            score: p.score || 0,
            correctAnswers: 0,
            totalAnswers: 0,
            isOnline: p.isOnline,
            socketId: p.socketId,
            characterConfig: p.characterConfig
          }))
          .sort((a, b) => b.score - a.score)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));

        io.to(roomCode).emit('game-started', {
          startedAt: room.startedAt,
          leaderboard: initialLeaderboard
        });

        callback({ success: true, leaderboard: initialLeaderboard });
        
        console.log(`🎮 Game started: ${roomCode} with ${initialLeaderboard.length} participants`);
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

        const leaderboard = room.participants
          .map(p => ({
            displayName: p.displayName,
            score: p.score,
            correctAnswers: p.answers.filter(a => a.isCorrect).length,
            totalAnswers: p.answers.length,
            characterConfig: p.characterConfig
          }))
          .sort((a, b) => b.score - a.score)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));

        // Lưu bảng xếp hạng trực tiếp vào Room với hạn 15 ngày
        room.finalLeaderboard = leaderboard;
        room.leaderboardExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 ngày
        await room.save();

        // Lưu vào RoomLeaderboard (tự động xóa sau 15 ngày nhờ TTL Index)
        try {
          const quizDoc = await Deck.findById(room.quizId);
          await RoomLeaderboard.findOneAndUpdate(
            { roomCode: roomCode.toUpperCase() },
            {
              roomCode: roomCode.toUpperCase(),
              quizTitle: quizDoc?.title || '',
              hostId: room.hostId,
              rankings: leaderboard,
              finishedAt: room.finishedAt,
              createdAt: new Date()
            },
            { upsert: true, new: true }
          );
        } catch (lbErr) {
          console.error('Error saving RoomLeaderboard:', lbErr);
        }

        io.to(roomCode).emit('game-ended', {
          leaderboard,
          finishedAt: room.finishedAt
        });

        callback({ success: true, leaderboard });
        
        console.log(`🏁 Game ended: ${roomCode} with ${leaderboard.length} players ranked`);
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

        // Ưu tiên trả về finalLeaderboard nếu còn hạn 15 ngày
        if (room.finalLeaderboard && room.finalLeaderboard.length > 0) {
          const isExpired = room.leaderboardExpiresAt && new Date() > room.leaderboardExpiresAt;
          if (!isExpired) {
            return callback({ success: true, leaderboard: room.finalLeaderboard });
          }
        }

        const leaderboard = room.participants
          .map(p => ({
            displayName: p.displayName,
            score: p.score,
            correctAnswers: p.answers.filter(a => a.isCorrect).length,
            totalAnswers: p.answers.length,
            isOnline: p.isOnline,
            characterConfig: p.characterConfig
          }))
          .sort((a, b) => b.score - a.score)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));

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

        console.log(`📡 [GET-ROOM-DATA] Room: ${roomCode} | Mode: ${room.mode} | Status: ${room.status}`);

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
    // Using 'disconnecting' to access socket.rooms before they are cleared
    socket.on('disconnecting', async () => {
      console.log(`❌ Socket disconnecting: ${socket.id}`);
      
      try {
        // Tìm tất cả rooms mà socket này đang ở
        const rooms = Array.from(socket.rooms);
        
        for (const roomCode of rooms) {
          if (roomCode === socket.id) continue; // Skip socket's own room
          
          const room = await Room.findOne({ roomCode });
          if (!room) continue;

          // Xử lý participant dựa trên socketId (use transaction)
          const result = await executeRoomTransaction(roomCode, async (room) => {
              if (room.status === 'waiting') {
                // Sảnh chờ: xóa hẳn để không chiếm chỗ
                const beforeCount = room.participants.length;
                room.participants = room.participants.filter(p => p.socketId !== socket.id);
                const afterCount = room.participants.length;
                if (beforeCount === afterCount) {
                  return { cancel: true };
                }
              } else {
                // Đang chơi hoặc đã kết thúc: giữ nguyên để bảo toàn điểm và xếp hạng
                const participant = room.participants.find(p => p.socketId === socket.id);
                if (participant) {
                  participant.isOnline = false;
                  participant.socketId = null;
                } else {
                  return { cancel: true };
                }
              }
          });

          if (result.success) {
            // Broadcast update
             io.to(roomCode).emit('participants-updated', {
              participants: result.room.participants,
              count: result.room.participants.length
            });
            console.log(`🚪 Disconnected socket from ${roomCode} (status: ${result.room.status})`);
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

// Cleanup job - Định kỳ dọn các phòng đã kết thúc từ lâu (việc xóa sau 2 tháng do TTL Index của MongoDB tự đảm nhiệm)
setInterval(async () => {
  try {
    const Room = require('./models/Room');
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    
    const result = await Room.deleteMany({
      status: 'finished',
      finishedAt: { $lt: twoMonthsAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleanup: Deleted ${result.deletedCount} old finished rooms`);
    }
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
}, 24 * 60 * 60 * 1000);
