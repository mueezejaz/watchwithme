import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { ExternalLinkIcon } from "../../lib/icons.jsx";

function parseYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function AddVideoDialog({ open, onOpenChange, onSubmit }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const id = parseYouTubeId(input.trim());
    if (!id) {
      setError("Invalid YouTube URL or video ID");
      return;
    }
    setError("");
    setInput("");
    onOpenChange(false);
    onSubmit(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add a video</DialogTitle>
        <DialogDescription>
          Paste a YouTube link or video ID to watch together
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <ExternalLinkIcon size={16} />
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-secondary outline-none"
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!input.trim()}>
            Add
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
