import { useRef, useEffect } from "react";
import { Card } from "./ui/card.jsx";
import { MicIcon, MicOffIcon } from "../lib/icons.jsx";

export default function AudioCard({ name, remoteStream, isLocal, soundLevel, isMicOn }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  return (
    <Card className="flex items-center gap-3 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
          isLocal
            ? "bg-primary text-white"
            : "bg-card text-foreground ring-1 ring-border"
        }`}
      >
        {name ? name.charAt(0).toUpperCase() : "?"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">
          {name || "Unknown"}
          {isLocal && (
            <span className="ml-1.5 text-xs text-text-secondary">(you)</span>
          )}
        </p>


      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            remoteStream ? "bg-success" : "bg-border"
          }`}
        />
        {isMicOn !== false ? <MicIcon /> : <MicOffIcon />}
      </div>

      {remoteStream && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      )}
    </Card>
  );
}
