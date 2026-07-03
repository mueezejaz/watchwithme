"use client";
import { useState } from "react";
import useSocket from "./hooks/useSocket";
import useLocalStorage from "./hooks/useLocalStorage";
import { nanoid } from "nanoid";
export default function Home() {
  const [input, setinput] = useState("");
  const [userId, setUserId] = useLocalStorage("id", () => {
    return nanoid();
  });
  console.log("hello world");
  const [socket, error] = useSocket(userId);
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
