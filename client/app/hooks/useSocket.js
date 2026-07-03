import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket(userId) {
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("connetction");
    if (!userId) return;
    const socketInstance = io(SERVER_URL, {
      auth: {
        userId,
      },
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 5000,
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
