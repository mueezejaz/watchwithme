import { useState } from "react";
import { useSocket } from "../context/SocketContext.jsx";
export default function HomePage() {
  const [input, setinput] = useState("");
  const { socket, error } = useSocket();
  return (
    <>
      <h1> hello world </h1>
      <input
        type="text"
        className="bg-red-900 text-blue-800 "
        value={input}
        onChange={(e) => {
          setinput(e.target.value);
        }}
      />
      <button
        onClick={() => {
          socket.emit("message", input);
        }}
      >
        send
      </button>
    </>
  );
}
