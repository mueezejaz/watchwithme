import { useState, useCallback } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { CopyIcon, CheckIcon } from "../../lib/icons.jsx";

export default function InviteDialog({ open, onOpenChange }) {
  const [copied, setCopied] = useState(false);
  const roomUrl = window.location.href;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = roomUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Invite people</DialogTitle>
        <DialogDescription>
          Share this link with others to join the room
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5">
          <span className="flex-1 truncate text-sm text-foreground">{roomUrl}</span>
          <Button size="sm" variant="ghost" onClick={handleCopy} className="shrink-0">
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
