"use client";
import { createContext, useContext, useState, useCallback } from "react";

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return (
    <MessagesContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
