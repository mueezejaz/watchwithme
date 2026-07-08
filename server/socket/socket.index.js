const rooms = new Map();

export default function registerSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.emit("error", { message: "Invalid user ID" });
      socket.disconnect();
      return;
    }
    console.log("new user connected", socket.id);
    socket.join(userId);

    socket.on("join-room", ({ roomId, name }, ack) => {
      if (!roomId || typeof roomId !== "string" || !roomId.trim()) {
        return ack?.({ success: false, error: "Invalid room ID" });
      }

      const trimmedName = name?.trim();
      if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 50) {
        return ack?.({
          success: false,
          error: "Name must be between 1 and 50 characters",
        });
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      const room = rooms.get(roomId);

      if (room.size >= 20) {
        return ack?.({
          success: false,
          error: "Room is full (max 20 participants)",
        });
      }

      for (const [, participant] of room) {
        if (participant.name === trimmedName) {
          return ack?.({
            success: false,
            error:
              "Someone already has that name in this room, pls change your name",
          });
        }
      }

      const prevRoomId = socket.data.roomId;
      if (prevRoomId && rooms.has(prevRoomId)) {
        rooms.get(prevRoomId).delete(socket.id);
        if (rooms.get(prevRoomId).size === 0) {
          rooms.delete(prevRoomId);
        }
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.name = trimmedName;
      room.set(socket.id, { userId, name: trimmedName });

      socket.to(roomId).emit("user-joined", { userId, name: trimmedName });
      ack?.({ success: true });
    });

    socket.on("signal", ({ to, data }) => {
      io.to(to).emit("signal", { from: userId, data });
    });

    socket.on("disconnect", () => {
      const { roomId, name } = socket.data;
      if (roomId && rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.delete(socket.id);
        if (room.size === 0) {
          rooms.delete(roomId);
        }
        socket.to(roomId).emit("user-left", { userId, name });
      }
    });
  });
}
