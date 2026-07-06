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

export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <SmileIcon />
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 grid min-w-[300px] max-w-[90vw] grid-cols-10 gap-1 rounded-lg border border-border bg-card p-2 shadow-lg">
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
