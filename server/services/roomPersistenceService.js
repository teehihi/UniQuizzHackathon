// services/roomPersistenceService.js
// Lớp bảo vệ dữ liệu phòng bất tử (Unbreakable Room Persistence & Self-Healing Engine)
const mongoose = require('mongoose');

const getBackupCollection = () => {
  return mongoose.connection.db.collection('rooms_backup');
};

const getRoomsCollection = () => {
  return mongoose.connection.db.collection('rooms');
};

// 1. Sao lưu phòng sang collection rooms_backup với chuẩn an toàn tuyệt đối (majority + journal)
const syncRoomToBackup = async (roomData) => {
  try {
    if (!roomData || !roomData.roomCode) return;
    const backupColl = getBackupCollection();
    const doc = roomData.toObject ? roomData.toObject() : { ...roomData };
    const { _id, ...updateFields } = doc;
    
    await backupColl.updateOne(
      { roomCode: doc.roomCode.toUpperCase() },
      { 
        $set: updateFields,
        $setOnInsert: { _id: _id || new mongoose.Types.ObjectId() }
      },
      { upsert: true, writeConcern: { w: 'majority', j: true } }
    );
  } catch (error) {
    console.error(`⚠️ [ROOM PERSISTENCE] Error syncing ${roomData?.roomCode} to backup:`, error.message);
  }
};

// 2. Tự động hồi sinh phòng nếu phát hiện bị mất trong collection rooms chính
const restoreRoomIfMissing = async (roomCode) => {
  try {
    if (!roomCode) return null;
    const upperCode = roomCode.toUpperCase();
    const roomsColl = getRoomsCollection();
    const backupColl = getBackupCollection();

    // Kiểm tra collection chính
    let room = await roomsColl.findOne({ roomCode: upperCode });
    if (room) return room;

    // Nếu bị mất trong collection chính, tìm trong bản sao lưu bất tử
    const backupRoom = await backupColl.findOne({ roomCode: upperCode });
    if (backupRoom) {
      console.warn(`🛡️ [AUTO-HEAL] Room ${upperCode} was missing from primary collection! Resurrecting from backup...`);
      const { _id, ...updateFields } = backupRoom;
      
      // Hồi sinh ngay lập tức vào collection chính với chuẩn majority và giữ nguyên _id gốc
      await roomsColl.updateOne(
        { roomCode: upperCode },
        { 
          $set: updateFields,
          $setOnInsert: { _id: _id }
        },
        { upsert: true, writeConcern: { w: 'majority', j: true } }
      );
      
      console.log(`✅ [AUTO-HEAL] Successfully resurrected room ${upperCode}!`);
      return backupRoom;
    }

    return null;
  } catch (error) {
    console.error(`⚠️ [AUTO-HEAL] Error checking/restoring room ${roomCode}:`, error.message);
    return null;
  }
};

// 3. Tự động kiểm tra và hồi sinh toàn bộ phòng của một host nếu bị mất
const restoreMyRoomsIfMissing = async (userId) => {
  try {
    if (!userId) return;
    const roomsColl = getRoomsCollection();
    const backupColl = getBackupCollection();
    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Tìm tất cả các phòng trong backup của host này
    const backupRooms = await backupColl.find({ hostId: userObjId }).toArray();
    for (const bRoom of backupRooms) {
      const exists = await roomsColl.findOne({ roomCode: bRoom.roomCode });
      if (!exists) {
        console.warn(`🛡️ [AUTO-HEAL] Restoring host room ${bRoom.roomCode} to primary collection...`);
        const { _id, ...updateFields } = bRoom;
        await roomsColl.updateOne(
          { roomCode: bRoom.roomCode },
          { 
            $set: updateFields,
            $setOnInsert: { _id: _id }
          },
          { upsert: true, writeConcern: { w: 'majority', j: true } }
        );
      }
    }
  } catch (error) {
    console.error(`⚠️ [AUTO-HEAL] Error restoring rooms for host ${userId}:`, error.message);
  }
};

// 4. Xóa vĩnh viễn phòng (CHỈ khi host chủ động bấm xóa)
const deleteRoomPermanently = async (roomCode) => {
  try {
    if (!roomCode) return;
    const upperCode = roomCode.toUpperCase();
    const roomsColl = getRoomsCollection();
    const backupColl = getBackupCollection();

    await Promise.all([
      roomsColl.deleteOne({ roomCode: upperCode }),
      backupColl.deleteOne({ roomCode: upperCode })
    ]);
    console.log(`🗑️ [ROOM PERSISTENCE] Permanently deleted room ${upperCode} from both collections.`);
  } catch (error) {
    console.error(`⚠️ [ROOM PERSISTENCE] Error deleting room ${roomCode}:`, error.message);
  }
};

// 5. Tiến trình kiểm tra bảo vệ ngầm định kỳ (mỗi 30 giây chạy quét tự động)
const startAutoHealDaemon = () => {
  console.log('🛡️ [AUTO-HEAL DAEMON] Room persistence monitor started (30s interval).');
  
  setInterval(async () => {
    try {
      if (mongoose.connection.readyState !== 1) return;
      const roomsColl = getRoomsCollection();
      const backupColl = getBackupCollection();

      // 1. Quét backup và tự động phục hồi bất kỳ phòng nào bị rơi rụng
      const backupRooms = await backupColl.find({}).toArray();
      for (const bRoom of backupRooms) {
        const primaryRoom = await roomsColl.findOne({ roomCode: bRoom.roomCode });
        if (!primaryRoom) {
          console.warn(`🛡️ [AUTO-HEAL DAEMON] Detected missing room ${bRoom.roomCode}! Re-inserting into primary...`);
          const { _id, ...updateFields } = bRoom;
          await roomsColl.updateOne(
            { roomCode: bRoom.roomCode },
            { 
              $set: updateFields,
              $setOnInsert: { _id: _id }
            },
            { upsert: true, writeConcern: { w: 'majority', j: true } }
          );
        }
      }

      // 2. Ngược lại, nếu có phòng mới trong rooms chưa có trong backup, đồng bộ sang backup
      const primaryRooms = await roomsColl.find({}).toArray();
      for (const pRoom of primaryRooms) {
        const inBackup = await backupColl.findOne({ roomCode: pRoom.roomCode });
        if (!inBackup) {
          const { _id, ...updateFields } = pRoom;
          await backupColl.updateOne(
            { roomCode: pRoom.roomCode },
            { 
              $set: updateFields,
              $setOnInsert: { _id: _id }
            },
            { upsert: true, writeConcern: { w: 'majority', j: true } }
          );
        }
      }
    } catch (err) {
      // Bỏ qua lỗi ngầm để không ảnh hưởng luồng chính
    }
  }, 30 * 1000);
};

module.exports = {
  syncRoomToBackup,
  restoreRoomIfMissing,
  restoreMyRoomsIfMissing,
  deleteRoomPermanently,
  startAutoHealDaemon
};
