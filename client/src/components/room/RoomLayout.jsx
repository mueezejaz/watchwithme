import { useState, useRef, useCallback, useEffect } from "react";
import { useUsers } from "../../context/UsersContext.jsx";
import { useMessages } from "../../context/MessagesContext.jsx";
import { VideoProvider, useVideo } from "../../context/VideoContext.jsx";
import { PortalContext } from "../../context/PortalContext.jsx";
import useWebRTC from "../../hooks/useWebRTC.js";
import useVideoSync from "../../hooks/useVideoSync.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { Alert, AlertDescription } from "../ui/alert.jsx";
import { MessageIcon, UsersIcon } from "../../lib/icons.jsx";
import { Dialog } from "../ui/dialog.jsx";
import ReactPlayerWrapper from "../video/ReactPlayerWrapper.jsx";
import VideoPlaceholder from "../video/VideoPlaceholder.jsx";
import Toolbar from "./Toolbar.jsx";
import ChatPanel from "./ChatPanel.jsx";
import ChatNotification from "./ChatNotification.jsx";
import ParticipantsPanel from "./ParticipantsPanel.jsx";
import AddVideoDialog from "./AddVideoDialog.jsx";
import InviteDialog from "./InviteDialog.jsx";

function RoomLayoutInner({
  roomId, myUserId, myName, stream, soundLevel, isMicOn, toggleMic,
  socket,
}) {
  const { users, updateUser } = useUsers();
  const { messages, addMessage } = useMessages();
  const { videoId } = useVideo();

  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [masterVolume, setMasterVolume] = useState(1);
  const [showSidebarInFullscreen, setShowSidebarInFullscreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fullscreenMode, setFullscreenMode] = useState("off");
  const [webrtcErrors, setWebrtcErrors] = useState([]);
  const [joiningRoom, setJoiningRoom] = useState(true);
  const onDataCbRef = useRef(null);
  const sectionRef = useRef(null);
  const prevMessagesLenRef = useRef(messages.length);
  const [portalTarget, setPortalTarget] = useState(null);

  const isFullscreen = fullscreenMode !== "off";

  const stableOnDataMessage = useCallback(
    (msg) => onDataCbRef.current?.(msg), []
  );

  const handleWebrtcError = useCallback((error) => {
    setWebrtcErrors((prev) => [...prev.slice(-4), error]);
  }, []);

  const { connectedPeers, sendMessageToAll, sendDataToAll } = useWebRTC({
    localStream: stream, socket, roomId, myUserId, myName,
    onDataMessage: stableOnDataMessage,
    onError: handleWebrtcError,
  });

  const {
    handleDataMessage, isRemoteAction, sendVideoSync, sendChangeVideo, sendSyncRequest,
  } = useVideoSync({ sendDataToAll });

  const handleAllDataMessages = useCallback(({ from, data }) => {
    handleDataMessage?.({ from, data });
    if (data.type === "mic-state") {
      updateUser(from, { micOn: data.micOn });
    }
    if (data.type === "sync-request") {
      sendDataToAll({ type: "mic-state", micOn: isMicOn });
    }
  }, [handleDataMessage, updateUser, sendDataToAll, isMicOn]);

  onDataCbRef.current = handleAllDataMessages;

  const handleToggleMic = useCallback(() => {
    toggleMic();
    sendDataToAll({ type: "mic-state", micOn: !isMicOn });
  }, [toggleMic, sendDataToAll, isMicOn]);

  const joiningResolvedRef = useRef(false);
  useEffect(() => {
    if (joiningResolvedRef.current) return;
    if (connectedPeers > 0) {
      joiningResolvedRef.current = true;
      setJoiningRoom(false);
      return;
    }
    const timer = setTimeout(() => {
      joiningResolvedRef.current = true;
      setJoiningRoom(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [connectedPeers]);

  const initialSyncSentRef = useRef(false);
  useEffect(() => {
    if (connectedPeers > 0 && !initialSyncSentRef.current) {
      initialSyncSentRef.current = true;
      sendSyncRequest();
      sendDataToAll({ type: "mic-state", micOn: isMicOn });
    }
  }, [connectedPeers, sendSyncRequest, sendDataToAll, isMicOn]);

  const handleSendChat = useCallback((text) => {
    sendMessageToAll(text);
    addMessage({ from: myUserId, fromName: myName, text, timestamp: Date.now() });
  }, [sendMessageToAll, addMessage, myUserId, myName]);

  const handleVideoSubmit = useCallback((videoId) => {
    sendChangeVideo(videoId);
  }, [sendChangeVideo]);

  const participantCount = Object.keys(users).length + 1;

  const toggleFullscreen = useCallback(() => {
    if (!sectionRef.current) return;
    if (fullscreenMode === "css") {
      setFullscreenMode("off");
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
      screen.orientation?.unlock();
    } else {
      const el = sectionRef.current;
      if (el.requestFullscreen) {
        el.requestFullscreen()
          .then(() => screen.orientation?.lock("landscape").catch(() => {}))
          .catch(() => setFullscreenMode("css"));
      } else {
        setFullscreenMode("css");
      }
    }
  }, [fullscreenMode]);

  useEffect(() => {
    const handleChange = () => {
      if (document.fullscreenElement) {
        setFullscreenMode("native");
      } else if (fullscreenMode === "native") {
        setFullscreenMode("off");
        screen.orientation?.unlock();
      }
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [fullscreenMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && fullscreenMode === "css") {
        setFullscreenMode("off");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenMode]);

  useEffect(() => {
    if (!isFullscreen) {
      setShowSidebarInFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen && !showSidebarInFullscreen && messages.length > prevMessagesLenRef.current) {
      setUnreadCount((c) => c + 1);
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages.length, isFullscreen, showSidebarInFullscreen]);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebarInFullscreen((s) => !s);
    setUnreadCount(0);
  }, []);

  const sidebarContent = (
    <>
      <Toolbar
        className="flex items-center justify-center gap-1 border-b border-border px-3 py-2"
        isMicOn={isMicOn}
        toggleMic={handleToggleMic}
        onAddVideo={() => setAddVideoOpen(true)}
        onInvite={() => setInviteOpen(true)}
      />

      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex justify-center border-b border-border px-3 py-2">
          <TabsList activeValue={activeTab} onValueChange={setActiveTab}>
            <TabsTrigger value="chat" activeValue={activeTab} onValueChange={setActiveTab} className="gap-1.5">
              <MessageIcon size={14} />
              Chat
            </TabsTrigger>
            <TabsTrigger value="participants" activeValue={activeTab} onValueChange={setActiveTab} className="gap-1.5">
              <UsersIcon size={14} />
              Members
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" activeValue={activeTab} className="flex min-h-0 flex-col overflow-hidden">
          <ChatPanel
            messages={messages}
            myUserId={myUserId}
            onSend={handleSendChat}
          />
        </TabsContent>

        <TabsContent value="participants" activeValue={activeTab} className="flex flex-col">
          <ParticipantsPanel
            users={users}
            myName={myName}
            soundLevel={soundLevel}
            isMicOn={isMicOn}
            masterVolume={masterVolume}
            onMasterVolumeChange={setMasterVolume}
          />
        </TabsContent>
      </Tabs>
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <Dialog open={joiningRoom}>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-foreground">Joining room...</p>
          <p className="text-sm text-text-secondary">Establishing secure connection</p>
        </div>
      </Dialog>

      {webrtcErrors.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
          {webrtcErrors.map((err, i) => (
            <Alert key={i} variant="destructive">
              <AlertDescription>{err}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">Room {roomId}</h1>
          <p className="text-sm text-text-secondary">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <section
          ref={sectionRef}
          className={`relative flex min-h-0 ${isFullscreen ? "flex-row" : "flex-col"} flex-1 md:min-w-0`}
          style={fullscreenMode === "css" ? { position: "fixed", inset: 0, zIndex: 50, background: "#000" } : undefined}
        >
          <div ref={(el) => { if (el) setPortalTarget(el); }} className="contents" />

          <PortalContext.Provider value={portalTarget}>
          <div className={`relative min-w-0 ${isFullscreen ? "flex-1 p-0" : "flex-shrink-0 max-h-[55vh] p-4 md:flex-1 md:max-h-none md:p-6"}`}>
            {videoId ? (
              <ReactPlayerWrapper
                isRemoteAction={isRemoteAction}
                sendVideoSync={sendVideoSync}
                isFullscreen={isFullscreen}
                showSidebarInFullscreen={showSidebarInFullscreen}
                onToggleSidebar={handleToggleSidebar}
                onToggleFullscreen={toggleFullscreen}
                unreadCount={unreadCount}
                onResetUnread={() => setUnreadCount(0)}
              />
            ) : (
              <VideoPlaceholder onAddVideo={() => setAddVideoOpen(true)} />
            )}
          </div>

          <ChatNotification
            messages={messages}
            active={isFullscreen && !showSidebarInFullscreen}
          />

          {!isFullscreen && (
            <div className="flex min-h-0 flex-1 flex-col border-t border-border md:hidden">
              {sidebarContent}
            </div>
          )}

          {isFullscreen && (
            <div
              className={`flex h-full flex-col bg-background/95 shadow-lg backdrop-blur-sm border-r border-border shrink-0 transition-all duration-300 ${
                showSidebarInFullscreen
                  ? "w-80 max-w-[85vw] opacity-100"
                  : "w-0 max-w-0 opacity-0"
              }`}
            >
              {sidebarContent}
            </div>
          )}

          </PortalContext.Provider>
        </section>

        <aside className="hidden min-h-0 flex-col border-border md:flex md:w-80 md:border-l">
          {sidebarContent}
        </aside>
      </div>

      <AddVideoDialog
        open={addVideoOpen}
        onOpenChange={setAddVideoOpen}
        onSubmit={handleVideoSubmit}
      />

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}

export default function RoomLayout(props) {
  return (
    <VideoProvider>
      <RoomLayoutInner {...props} />
    </VideoProvider>
  );
}
