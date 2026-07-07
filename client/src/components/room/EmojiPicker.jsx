import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button.jsx";
import { SmileIcon } from "../../lib/icons.jsx";

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
  "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗",
  "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
  "🤔", "🤐", "😐", "😑", "😶", "😏", "😒", "🙄",
  "😬", "😮", "😯", "😲", "😳", "🥺", "😢", "😭",
  "😤", "😡", "🤬", "😈", "👿", "💀", "☠️", "💩",
  "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌",
  "👐", "🤲", "🤝", "🙏", "✌️", "🤟", "🤘", "👌",
  "❤️", "💔", "💖", "💗", "💙", "💚", "💛", "💜",
  "🔥", "⭐", "✨", "💯", "🎉", "🎊", "🎈", "🎁",
];

export default function EmojiPicker({ onSelect, closeSignal }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [closeSignal]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative z-[9999]">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <SmileIcon />
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 z-[9999] mb-2 grid min-w-[300px] max-w-[90vw] max-h-[260px] grid-cols-10 gap-1 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="rounded p-1 text-xl hover:bg-[var(--sidebar)]"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
