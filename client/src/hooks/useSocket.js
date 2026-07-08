import { useEffect, useState } from "react";
import { io } from "socket.io-client";
const isProduction = process.env.npm_package_config_production === "true";
export default function useSocketHook(userId) {
  const SERVER_URL = isProduction
    ? "https://sync-watch-production.up.railway.app"
    : "http://localhost:3001";
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    console.log("this is url i am connetin to", SERVER_URL);
    const socketInstance = io(SERVER_URL, {
      auth: {
        userId,
      },
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    socketInstance.on("connect", () => {
      setSocket(socketInstance);
      setError(null);
    });

    socketInstance.on("connect_error", (err) => {
      console.error(err);
      setError(err);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [SERVER_URL, userId]);

  return [socket, error];
}
