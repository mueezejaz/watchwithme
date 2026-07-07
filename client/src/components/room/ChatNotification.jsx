import { useState, useEffect, useRef } from "react";

const TRIM_LENGTH = 60;
const DURATION = 4500;

let notifId = 0;

export default function ChatNotification({ messages, active }) {
  const [items, setItems] = useState([]);
  const prevLenRef = useRef(messages.length);
  const timersRef = useRef([]);

  useEffect(() => {
    if (!active) {
      setItems([]);
      prevLenRef.current = messages.length;
      return;
    }

    if (messages.length > prevLenRef.current) {
      const newMsgs = messages.slice(prevLenRef.current);
      const batch = newMsgs.map((msg) => {
        const id = ++notifId;
        const text =
          msg.text.length > TRIM_LENGTH
            ? msg.text.slice(0, TRIM_LENGTH) + "..."
            : msg.text;
        return { id, fromName: msg.fromName, text };
      });

      setItems((prev) => [...prev, ...batch]);

      const timer = setTimeout(() => {
        setItems((prev) => prev.slice(batch.length));
      }, DURATION);
      timersRef.current.push(timer);
    }

    prevLenRef.current = messages.length;

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [messages, active]);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="animate-float-up rounded-lg border border-border bg-card px-4 py-2 shadow-lg"
        >
          <p className="text-xs font-semibold text-primary">{item.fromName}</p>
          <p className="text-sm text-foreground">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
