"use client";
import { useRef, useEffect } from "react";
import { Card } from "@/app/components/ui/card";

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" ry="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

export default function AudioCard({ name, remoteStream, isLocal, soundLevel, isMicOn }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
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

        {isLocal && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${Math.max((soundLevel || 0) * 100, 2)}%`,
                  backgroundColor: isMicOn
                    ? soundLevel > 0.6
                      ? "var(--accent)"
                      : "var(--primary)"
                    : "var(--border)",
                }}
              />
            </div>
            <span className="text-xs text-text-secondary">
              {Math.round((soundLevel || 0) * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            remoteStream ? "bg-success" : "bg-border"
          }`}
        />
        <MicIcon />
      </div>

      {remoteStream && <audio ref={audioRef} autoPlay className="hidden" />}
    </Card>
  );
}
