import { useState, useEffect, useRef, useCallback } from "react";

const TRIM_LENGTH = 60;
const DURATION = 4500;

let notifId = 0;

export default function ChatNotification({ messages, active }) {
  const [items, setItems] = useState([]);
  const prevLenRef = useRef(messages.length);
  const timersRef = useRef({});

  const dismissItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  useEffect(() => {
    if (!active) {
      setItems([]);
      prevLenRef.current = messages.length;
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
      return;
    }

    if (messages.length > prevLenRef.current) {
      const newMsgs = messages.slice(prevLenRef.current);
      newMsgs.forEach((msg) => {
        const id = ++notifId;
        const text =
          msg.text.length > TRIM_LENGTH
            ? msg.text.slice(0, TRIM_LENGTH) + "..."
            : msg.text;
        setItems((prev) => [...prev, { id, fromName: msg.fromName, text }]);
        timersRef.current[id] = setTimeout(() => dismissItem(id), DURATION);
      });
    }

    prevLenRef.current = messages.length;
  }, [messages, active, dismissItem]);

  if (items.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => dismissItem(item.id)}
          className="cursor-pointer animate-float-up rounded-lg border border-border bg-card px-4 py-2 shadow-lg"
        >
          <p className="text-xs font-semibold text-primary">{item.fromName}</p>
          <p className="text-sm text-foreground">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
