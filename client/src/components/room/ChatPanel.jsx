import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../ui/button.jsx";
import { SendIcon } from "../../lib/icons.jsx";
import EmojiPicker from "./EmojiPicker.jsx";

export default function ChatPanel({ messages, myUserId, onSend }) {
  const [input, setInput] = useState("");
  const [sendCount, setSendCount] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleEmojiSelect = useCallback((emoji) => {
    setInput((prev) => prev + emoji);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    setSendCount((c) => c + 1);
    requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({ block: "nearest" });
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4 [overflow-anchor:auto]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-text-secondary">No messages yet. Say hello!</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === myUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] break-words rounded-lg px-4 py-2 text-sm ${
                msg.from === myUserId
                  ? "bg-primary text-white"
                  : "bg-card text-foreground"
              }`}
            >
              <p className="text-xs opacity-70">{msg.fromName}</p>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <EmojiPicker onSelect={handleEmojiSelect} closeSignal={sendCount} />
        <input
          ref={inputRef}
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
