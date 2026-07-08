import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import registerSocket from "./socket/socket.index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.npm_package_config_production !== "true";

const port = process.env.PORT || 3001;
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://mueezejaz.github.io",
    ],
    credentials: true,
  }),
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://mueezejaz.github.io",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
registerSocket(io);

if (isDev) {
  const distPath = resolve(__dirname, "..", "client", "dist");
  app.use(express.static(distPath));
  app.get("/{*path}", (req, res) => {
    res.sendFile(resolve(distPath, "index.html"));
  });
}

server.listen(port, () => {
  console.log(`App started on port ${port}`);
  if (isDev) console.log(`Serving static files from ${resolve(__dirname, "..", "client", "dist")}`);
});
