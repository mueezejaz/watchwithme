import { createContext, useContext, useState, useCallback } from "react";

const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState({});

  const addUser = useCallback((userId, userData) => {
    setUsers((prev) => ({ ...prev, [userId]: userData }));
  }, []);

  const removeUser = useCallback((userId) => {
    setUsers((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const updateUser = useCallback((userId, updates) => {
    setUsers((prev) => {
      const existing = prev[userId];
      if (!existing) return prev;
      return { ...prev, [userId]: { ...existing, ...updates } };
    });
  }, []);

  return (
    <UsersContext.Provider value={{ users, addUser, removeUser, updateUser }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
