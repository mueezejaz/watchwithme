export default function registerSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    console.log("new user connected", socket.id);
    socket.join(userId);

    socket.on("join-room", ({ roomId, name }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.name = name;
      socket.to(roomId).emit("user-joined", { userId, name });
    });

    socket.on("signal", ({ to, data }) => {
      io.to(to).emit("signal", { from: userId, data });
    });

    socket.on("disconnect", () => {
      const { roomId } = socket.data;
      if (roomId) {
        socket.to(roomId).emit("user-left", { userId });
      }
    });
  });
}
