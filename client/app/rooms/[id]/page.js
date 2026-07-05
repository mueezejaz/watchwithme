"use client";
import { use, useEffect, useRef } from "react";
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
import AudioCard from "@/app/components/AudioCard";
import useMediaDevices from "@/app/hooks/useMediaDevices";
import useWebRTC from "@/app/hooks/useWebRTC";
import { useSocket } from "@/app/context/SocketContext";
import { UsersProvider, useUsers } from "@/app/context/UsersContext";
import { MessagesProvider, useMessages } from "@/app/context/MessagesContext";
import useLocalStorage from "@/app/hooks/useLocalStorage";

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" ry="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7.8 7.8 0 0 0 19 10v-1" />
      <path d="M5 10v1a7 7 0 0 0 11.42 4.87" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <rect x="9" y="2" width="6" height="11" rx="3" ry="3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function RoomInner({ roomId, myUserId, myName, stream, soundLevel, isMicOn, toggleMic, devices, selectedDeviceId, changeDevice, socket }) {
  const { users } = useUsers();
  const { messages, addMessage } = useMessages();
  const { sendMessageToAll } = useWebRTC({ localStream: stream, socket, roomId, myUserId, myName });
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessageToAll(chatInput.trim());
    addMessage({ from: myUserId, fromName: myName, text: chatInput.trim(), timestamp: Date.now() });
    setChatInput("");
  };

  const participantCount = Object.keys(users).length + 1;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold">Room {roomId}</h1>
          <p className="text-sm text-text-secondary">{participantCount} participant{participantCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full transition-all duration-75" style={{
                width: `${Math.max(soundLevel * 100, 2)}%`,
                backgroundColor: isMicOn ? soundLevel > 0.6 ? "var(--accent)" : "var(--primary)" : "var(--border)",
              }} />
            </div>
            <Button variant={isMicOn ? "default" : "secondary"} size="sm" onClick={toggleMic}>
              {isMicOn ? <MicIcon /> : <MicOffIcon />}
            </Button>
          </div>
          <select value={selectedDeviceId || ""} onChange={(e) => changeDevice(e.target.value)} className="max-w-40 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Mic ${device.deviceId.slice(0, 8)}`}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 space-y-3 overflow-y-auto border-r border-border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Participants</h2>
          <AudioCard name={myName} isLocal soundLevel={soundLevel} isMicOn={isMicOn} />
          {Object.entries(users).map(([userId, user]) => (
            <AudioCard key={userId} name={user.name} remoteStream={user.remoteStream} />
          ))}
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && <p className="text-center text-sm text-text-secondary">No messages yet. Say hello!</p>}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === myUserId ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs rounded-lg px-4 py-2 text-sm ${msg.from === myUserId ? "bg-primary text-white" : "bg-card text-foreground"}`}>
                  <p className="text-xs opacity-70">{msg.fromName}</p>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-4">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary" />
            <Button type="submit" size="sm" disabled={!chatInput.trim()}><SendIcon /></Button>
          </form>
        </main>
      </div>
    </div>
  );
}

function RoomJoined(props) {
  return (
    <UsersProvider>
      <MessagesProvider>
        <RoomInner {...props} />
      </MessagesProvider>
    </UsersProvider>
  );
}

export default function RoomPage({ params }) {
  const { id } = use(params);
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
    if (!isMicOn) toggleMic();
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
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        changeDevice={changeDevice}
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
