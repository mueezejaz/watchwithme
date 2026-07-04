"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useSocketHook from "../hooks/useSocket";
import useLocalStorage from "../hooks/useLocalStorage";
import { nanoid } from "nanoid";

const SocketContext = createContext(null);

export function SocketContextProvider({ children }) {
  const [userId, setUserId] = useLocalStorage("id", () => nanoid());
  const [socket, error] = useSocketHook(userId);
  return (
    <SocketContext.Provider value={{ socket, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
}
