import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button.jsx";
import { SendIcon } from "../../lib/icons.jsx";

export default function ChatPanel({ messages, myUserId, onSend }) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-text-secondary">No messages yet. Say hello!</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === myUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                msg.from === myUserId
                  ? "bg-primary text-white"
                  : "bg-card text-foreground"
              }`}
            >
              <p className="text-xs opacity-70">{msg.fromName}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit" size="sm" disabled={!input.trim()}>
          <SendIcon />
        </Button>
      </form>
    </div>
  );
}
