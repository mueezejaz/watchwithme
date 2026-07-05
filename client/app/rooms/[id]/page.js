"use client";
import { use, useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import useMediaDevices from "@/app/hooks/useMediaDevices";
import { useSocket } from "@/app/context/SocketContext";

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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

function MicOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7.8 7.8 0 0 0 19 10v-1" />
      <path d="M5 10v1a7 7 0 0 0 11.42 4.87" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <rect x="9" y="2" width="6" height="11" rx="3" ry="3" />
    </svg>
  );
}

export default function RoomPage({ params }) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const { socket } = useSocket();

  const {
    devices,
    selectedDeviceId,
    soundLevel,
    isMicOn,
    permissionGranted,
    error,
    requestPermission,
    toggleMic,
    changeDevice,
  } = useMediaDevices();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleJoin = () => {
    if (!name.trim()) return;
    socket?.emit("join-room", {
      roomId: id,
      name: name.trim(),
    });
    setHasJoined(true);
  };

  if (hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-text-secondary">
          You have joined room <span className="text-foreground">{id}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
          <CardDescription>Room: {id}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Input Device</label>
            <select
              value={selectedDeviceId || ""}
              onChange={(e) => changeDevice(e.target.value)}
              disabled={!permissionGranted || devices.length === 0}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {!permissionGranted && (
                <option value="">Select a microphone</option>
              )}
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          {permissionGranted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sound Level</label>
                <span className="text-xs text-text-secondary">
                  {Math.round(soundLevel * 100)}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.max(soundLevel * 100, 2)}%`,
                    backgroundColor: isMicOn
                      ? soundLevel > 0.6
                        ? "var(--accent)"
                        : "var(--primary)"
                      : "var(--border)",
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="gap-2">
          {permissionGranted && (
            <Button
              variant={isMicOn ? "default" : "secondary"}
              onClick={toggleMic}
              className="flex-1"
            >
              {isMicOn ? <MicIcon /> : <MicOffIcon />}
              {isMicOn ? "On" : "Off"}
            </Button>
          )}
          <Button
            onClick={handleJoin}
            disabled={!name.trim()}
            className="flex-1"
          >
            Join Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
