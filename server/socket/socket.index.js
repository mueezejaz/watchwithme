export default function registerSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;

    console.log("New user:", userId);
    socket.on("message", (message) => {
      console.log(message);
    });
    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });
}
