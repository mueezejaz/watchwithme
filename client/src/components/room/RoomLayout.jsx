import { useState, useRef, useCallback, useEffect } from "react";
import { useUsers } from "../../context/UsersContext.jsx";
import { useMessages } from "../../context/MessagesContext.jsx";
import { VideoProvider, useVideo } from "../../context/VideoContext.jsx";
import useWebRTC from "../../hooks/useWebRTC.js";
import useVideoSync from "../../hooks/useVideoSync.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs.jsx";
import { MessageIcon, UsersIcon } from "../../lib/icons.jsx";
import ReactPlayerWrapper from "../video/ReactPlayerWrapper.jsx";
import VideoPlaceholder from "../video/VideoPlaceholder.jsx";
import Toolbar from "./Toolbar.jsx";
import ChatPanel from "./ChatPanel.jsx";
import ParticipantsPanel from "./ParticipantsPanel.jsx";
import AddVideoDialog from "./AddVideoDialog.jsx";
import InviteDialog from "./InviteDialog.jsx";

function RoomLayoutInner({
  roomId, myUserId, myName, stream, soundLevel, isMicOn, toggleMic,
  socket,
}) {
  const { users } = useUsers();
  const { messages, addMessage } = useMessages();
  const { videoId } = useVideo();

  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const onDataCbRef = useRef(null);

  const stableOnDataMessage = useCallback(
    (msg) => onDataCbRef.current?.(msg), []
  );

  const { connectedPeers, sendMessageToAll, sendDataToAll } = useWebRTC({
    localStream: stream, socket, roomId, myUserId, myName,
    onDataMessage: stableOnDataMessage,
  });

  const {
    handleDataMessage, isRemoteAction, sendVideoSync, sendChangeVideo, sendSyncRequest,
  } = useVideoSync({ sendDataToAll });

  onDataCbRef.current = handleDataMessage;

  const initialSyncSentRef = useRef(false);
  useEffect(() => {
    if (connectedPeers > 0 && !initialSyncSentRef.current) {
      initialSyncSentRef.current = true;
      sendSyncRequest();
    }
  }, [connectedPeers, sendSyncRequest]);

  const handleSendChat = useCallback((text) => {
    sendMessageToAll(text);
    addMessage({ from: myUserId, fromName: myName, text, timestamp: Date.now() });
  }, [sendMessageToAll, addMessage, myUserId, myName]);

  const handleVideoSubmit = useCallback((videoId) => {
    sendChangeVideo(videoId);
  }, [sendChangeVideo]);

  const participantCount = Object.keys(users).length + 1;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">Room {roomId}</h1>
          <p className="text-sm text-text-secondary">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <section className="relative flex flex-col md:flex-1 md:min-w-0">
          <div className="flex-1 p-4 md:p-6">
            {videoId ? (
              <ReactPlayerWrapper
                isRemoteAction={isRemoteAction}
                sendVideoSync={sendVideoSync}
              />
            ) : (
              <VideoPlaceholder onAddVideo={() => setAddVideoOpen(true)} />
            )}
          </div>

          <Toolbar
            className="flex items-center justify-center gap-1 border-t border-border px-4 py-2 md:hidden"
            isMicOn={isMicOn}
            toggleMic={toggleMic}
            onAddVideo={() => setAddVideoOpen(true)}
            onInvite={() => setInviteOpen(true)}
          />
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden border-border md:w-80 md:border-l">
          <Toolbar
            className="hidden items-center justify-center gap-1 border-b border-border px-3 py-2 md:flex"
            isMicOn={isMicOn}
            toggleMic={toggleMic}
            onAddVideo={() => setAddVideoOpen(true)}
            onInvite={() => setInviteOpen(true)}
          />

          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
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

            <TabsContent value="chat" activeValue={activeTab} className="flex flex-col">
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
              />
            </TabsContent>
          </Tabs>
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
