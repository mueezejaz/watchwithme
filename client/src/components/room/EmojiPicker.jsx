import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button.jsx";
import { SmileIcon } from "../../lib/icons.jsx";
import { usePortalTarget } from "../../context/PortalContext.jsx";

const EMOJIS = [
  // Smileys & happy faces
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
  "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
  "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝",
  "🤑", "🤗", "🤭", "🫢", "🫣", "🤫", "🤔", "🫡",

  // Neutral / skeptical / sleepy
  "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒",
  "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴",

  // Sick / unwell / disguised
  "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶",
  "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "🥸", "😎",

  // Shocked / sad / crying
  "🤓", "🧐", "😕", "🫤", "😟", "🙁", "☹️", "😮",
  "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰",
  "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓",

  // Angry / evil / dark
  "😩", "😫", "🥱", "😤", "😡", "🤬", "😈", "👿",
  "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽",
  "👾", "🤖",

  // Hand gestures
  "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌",
  "👐", "🤲", "🤝", "🙏", "✌️", "🤟", "🤘", "👌",
  "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋",
  "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦾",

  // Hearts
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💖", "💗", "💓", "💞",
  "💕", "💘", "💝", "💟",

  // Symbols & celebration
  "🔥", "⭐", "🌟", "✨", "💫", "💯", "💢", "💥",
  "💦", "💨", "🕳️", "💣", "💬", "💭", "🗯️", "💤",
  "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉",
  "🎯", "🎮", "🎲", "🧩",

  // Animals
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
  "🐧", "🐦", "🐤", "🦄", "🐝", "🦋", "🐢", "🐍",

  // Food
  "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒",
  "🍑", "🥭", "🍍", "🥥", "🍕", "🍔", "🍟", "🌭",
  "🍿", "🧁", "🍩", "🍪", "🍫", "🍬", "🍭", "☕",

  // Travel / objects
  "🚀", "✈️", "🚗", "🚲", "⛵", "🌍", "🌈", "☀️",
  "🌙", "⚡", "❄️", "🌊", "🎵", "🎶", "📱", "💻",
];

const POPUP_WIDTH = 300;
const POPUP_HEIGHT = 260;
const GAP = 8;

export default function EmojiPicker({ onSelect, closeSignal }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const [pos, setPos] = useState({ top: "auto", bottom: "auto", left: 0 });
  const portalTarget = usePortalTarget();

  useEffect(() => {
    setOpen(false);
  }, [closeSignal]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const positionPopup = useCallback(() => {
    if (!open) return;
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const spaceAbove = rect.top - GAP;
    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    let left = Math.min(rect.left, window.innerWidth - POPUP_WIDTH - GAP);
    left = Math.max(GAP, left);

    if (spaceAbove >= POPUP_HEIGHT) {
      setPos({
        bottom: `${window.innerHeight - rect.top + GAP}px`,
        top: "auto",
        left: `${left}px`,
      });
    } else {
      setPos({
        top: `${rect.bottom + GAP}px`,
        bottom: "auto",
        left: `${left}px`,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    positionPopup();
    window.addEventListener("scroll", positionPopup, true);
    window.addEventListener("resize", positionPopup);
    return () => {
      window.removeEventListener("scroll", positionPopup, true);
      window.removeEventListener("resize", positionPopup);
    };
  }, [open, positionPopup]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={triggerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onPointerDown={handleToggle}
      >
        <SmileIcon />
      </Button>
      {open && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            zIndex: 9999,
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
          }}
          className="grid min-w-[300px] max-w-[90vw] max-h-[260px] grid-cols-10 gap-1 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelect(emoji);
              }}
              className="rounded p-1 text-xl hover:bg-[var(--sidebar)]"
            >
              {emoji}
            </button>
          ))}
        </div>,
        portalTarget ?? document.body
      )}
    </div>
  );
}
