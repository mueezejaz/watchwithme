import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import registerSocket from "./socket/socket.index.js";

const port = 3001;
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
registerSocket(io);
app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

server.listen(port, () => {
  console.log(`App started on port ${port}`);
});
