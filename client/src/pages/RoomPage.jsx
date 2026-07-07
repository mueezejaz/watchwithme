import { useEffect, useRef } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { MicIcon, MicOffIcon } from "../lib/icons.jsx";
import useMediaDevices from "../hooks/useMediaDevices.js";
import { useSocket } from "../context/SocketContext.jsx";
import { UsersProvider } from "../context/UsersContext.jsx";
import { MessagesProvider } from "../context/MessagesContext.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import RoomLayout from "../components/room/RoomLayout.jsx";

function RoomJoined(props) {
  return (
    <UsersProvider>
      <MessagesProvider>
        <RoomLayout {...props} />
      </MessagesProvider>
    </UsersProvider>
  );
}

export default function RoomPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const { socket } = useSocket();
  const [myUserId] = useLocalStorage("id", () => null);

  const { devices, selectedDeviceId, stream, soundLevel, isMicOn, permissionGranted, permissionDenied, isBlocked, error, requestPermission, toggleMic, changeDevice } = useMediaDevices();

  const requestCountRef = useRef(0);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (permissionDenied && !isBlocked && requestCountRef.current < 3) {
      const timer = setTimeout(() => {
        requestCountRef.current += 1;
        requestPermission();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [permissionDenied, isBlocked, requestPermission]);

  const handleJoin = () => {
    if (!name.trim() || !permissionGranted) return;
    socket?.emit("join-room", { roomId: id, name: name.trim() });
    setHasJoined(true);
  };

  if (hasJoined) {
    return (
      <RoomJoined
        roomId={id}
        myUserId={myUserId}
        myName={name.trim()}
        stream={stream}
        soundLevel={soundLevel}
        isMicOn={isMicOn}
        toggleMic={toggleMic}
        socket={socket}
      />
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
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {!permissionGranted && !permissionDenied && !error && (
            <div className="flex items-center gap-2 rounded-md bg-card px-4 py-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-text-secondary">Requesting microphone access...</p>
            </div>
          )}

          {isBlocked && (
            <div className="space-y-3 rounded-md border border-error/30 bg-error/10 px-4 py-3">
              <p className="text-sm font-medium text-error">Microphone access is blocked</p>
              <div className="space-y-1 text-xs text-text-secondary">
                <p>To enable microphone access:</p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li>Click the lock/info icon in the address bar</li>
                  <li>Find "Microphone" in the permissions list</li>
                  <li>Change it from "Block" to "Allow"</li>
                  <li>Reload the page</li>
                </ul>
              </div>
              <Button variant="outline" size="sm" onClick={requestPermission}>
                Try Again
              </Button>
            </div>
          )}

          {permissionDenied && !isBlocked && (
            <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3">
              <p className="text-sm text-warning">Microphone access is needed to join the room</p>
            </div>
          )}

          {error && !isBlocked && permissionDenied && (
            <Button variant="outline" onClick={requestPermission} className="w-full">
              Retry Mic Access
            </Button>
          )}

          {error && !permissionDenied && !isBlocked && (
            <p className="text-sm text-error">{error}</p>
          )}

          {permissionGranted && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Device</label>
                <select value={selectedDeviceId || ""} onChange={(e) => changeDevice(e.target.value)} disabled={!permissionGranted || devices.length === 0} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary">
                  {!permissionGranted && <option value="">Select a microphone</option>}
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${device.deviceId.slice(0, 8)}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sound Level</label>
                  <span className="text-xs text-text-secondary">{Math.round(soundLevel * 100)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full transition-all duration-75" style={{
                    width: `${Math.max(soundLevel * 100, 2)}%`,
                    backgroundColor: isMicOn ? soundLevel > 0.6 ? "var(--accent)" : "var(--primary)" : "var(--border)",
                  }} />
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          {permissionGranted && (
            <Button variant={isMicOn ? "default" : "secondary"} onClick={toggleMic} className="flex-1">
              {isMicOn ? <MicIcon /> : <MicOffIcon />}
              {isMicOn ? "On" : "Off"}
            </Button>
          )}
          <Button onClick={handleJoin} disabled={!name.trim() || !permissionGranted} className="flex-1">Join Room</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
