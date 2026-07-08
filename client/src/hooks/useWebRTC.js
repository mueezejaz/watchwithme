import { useState, useEffect, useRef, useCallback } from "react";
import { useUsers } from "../context/UsersContext.jsx";
import { useMessages } from "../context/MessagesContext.jsx";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

export default function useWebRTC({
  localStream,
  socket,
  roomId,
  myUserId,
  myName,
  onDataMessage,
  onError,
}) {
  const [connectedPeers, setConnectedPeers] = useState(0);
  const { addUser, removeUser, updateUser } = useUsers();
  const { addMessage } = useMessages();

  const peerConnections = useRef(new Map());
  const dataChannels = useRef(new Map());
  const pendingCandidates = useRef(new Map());
  const makingOffer = useRef(false);
  const retryCount = useRef(new Map());

  const setupDataChannel = useCallback(
    (targetUserId, channel) => {
      dataChannels.current.set(targetUserId, channel);

      channel.onopen = () => {
        updateUser(targetUserId, { connected: true });
        setConnectedPeers((prev) => prev + 1);
      };

      channel.onclose = () => {
        updateUser(targetUserId, { connected: false });
        setConnectedPeers((prev) => Math.max(0, prev - 1));
      };

      channel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "chat") {
            addMessage({
              from: targetUserId,
              fromName: data.fromName,
              text: data.text,
              timestamp: Date.now(),
            });
          }
          onDataMessage?.({ from: targetUserId, data });
        } catch {}
      };
    },
    [addMessage, updateUser, onDataMessage],
  );

  const getOrCreatePC = useCallback(
    (targetUserId) => {
      let pc = peerConnections.current.get(targetUserId);
      if (pc) return pc;

      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("signal", {
            to: targetUserId,
            data: { type: "ice-candidate", candidate: event.candidate },
          });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          updateUser(targetUserId, { remoteStream });
        }
      };

      pc.ondatachannel = (event) => {
        setupDataChannel(targetUserId, event.channel);
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed"
        ) {
          cleanupPeer(targetUserId);
        }
      };

      peerConnections.current.set(targetUserId, pc);
      return pc;
    },
    [localStream, socket, updateUser, setupDataChannel],
  );

  const cleanupPeer = useCallback(
    (userId) => {
      const pc = peerConnections.current.get(userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(userId);
      }
      dataChannels.current.delete(userId);
      pendingCandidates.current.delete(userId);
      retryCount.current.delete(userId);
      removeUser(userId);
    },
    [removeUser],
  );

  const initiateConnection = useCallback(
    async (targetUserId, targetName) => {
      addUser(targetUserId, {
        name: targetName,
        connected: false,
        remoteStream: null,
      });

      const pc = getOrCreatePC(targetUserId);
      const channel = pc.createDataChannel("chat");
      setupDataChannel(targetUserId, channel);

      try {
        makingOffer.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit("signal", {
          to: targetUserId,
          data: { type: "offer", offer: pc.localDescription, fromName: myName },
        });
        retryCount.current.delete(targetUserId);
      } catch (err) {
        const current = retryCount.current.get(targetUserId) || 0;
        if (current < MAX_RETRIES) {
          retryCount.current.set(targetUserId, current + 1);
          onError?.(
            `Connection to ${targetName} failed, retrying... (${current + 1}/${MAX_RETRIES})`,
          );
          setTimeout(
            () => initiateConnection(targetUserId, targetName),
            RETRY_DELAY,
          );
        } else {
          onError?.(
            `Failed to connect to ${targetName}. Please try refreshing.`,
          );
          cleanupPeer(targetUserId);
        }
      } finally {
        makingOffer.current = false;
      }
    },
    [
      addUser,
      getOrCreatePC,
      setupDataChannel,
      socket,
      myName,
      onError,
      cleanupPeer,
    ],
  );

  const sendMessage = useCallback(
    (targetUserId, text) => {
      const channel = dataChannels.current.get(targetUserId);
      if (channel && channel.readyState === "open") {
        channel.send(JSON.stringify({ type: "chat", fromName: myName, text }));
      }
    },
    [myName],
  );

  const sendMessageToAll = useCallback(
    (text) => {
      dataChannels.current.forEach((channel, userId) => {
        if (channel.readyState === "open") {
          channel.send(
            JSON.stringify({ type: "chat", fromName: myName, text }),
          );
        }
      });
    },
    [myName],
  );

  const sendDataToAll = useCallback((jsonData) => {
    dataChannels.current.forEach((channel) => {
      if (channel.readyState === "open") {
        channel.send(JSON.stringify(jsonData));
      }
    });
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleSignal = async ({ from, data }) => {
      if (data.type === "offer") {
        addUser(from, {
          name: data.fromName || from,
          connected: false,
          remoteStream: null,
        });
        const pc = getOrCreatePC(from);

        try {
          const offerCollision =
            pc.signalingState !== "stable" && !makingOffer.current;

          if (offerCollision) {
            if (myUserId < from) {
              await pc.setLocalDescription({ type: "rollback" });
            } else {
              return;
            }
          }

          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const candidates = pendingCandidates.current.get(from) || [];
          await Promise.all(
            candidates.map((c) => pc.addIceCandidate(new RTCIceCandidate(c))),
          );
          pendingCandidates.current.delete(from);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("signal", {
            to: from,
            data: { type: "answer", answer: pc.localDescription },
          });
        } catch (err) {
          onError?.(
            `Connection error with ${data.fromName || from}: ${err.message}`,
          );
        }
      } else if (data.type === "answer") {
        const pc = peerConnections.current.get(from);
        if (pc && pc.signalingState === "have-local-offer") {
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer),
            );
            const candidates = pendingCandidates.current.get(from) || [];
            await Promise.all(
              candidates.map((c) => pc.addIceCandidate(new RTCIceCandidate(c))),
            );
            pendingCandidates.current.delete(from);
          } catch (err) {
            onError?.(`Connection error: ${err.message}`);
          }
        }
      } else if (data.type === "ice-candidate") {
        const pc = peerConnections.current.get(from);
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            onError?.(`Network error: ${err.message}`);
          }
        } else {
          if (!pendingCandidates.current.has(from)) {
            pendingCandidates.current.set(from, []);
          }
          pendingCandidates.current.get(from).push(data.candidate);
        }
      }
    };

    const handleUserJoined = ({ userId: newUserId, name }) => {
      addUser(newUserId, { name, connected: false, remoteStream: null });
      addMessage({ type: "system", text: `${name} joined the room`, timestamp: Date.now() });
      initiateConnection(newUserId, name);
    };

    const handleUserLeft = ({ userId: leftUserId, name }) => {
      cleanupPeer(leftUserId);
      addMessage({ type: "system", text: `${name || "Someone"} left the room`, timestamp: Date.now() });
    };

    socket.on("signal", handleSignal);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("signal", handleSignal);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [
    socket,
    roomId,
    getOrCreatePC,
    initiateConnection,
    cleanupPeer,
    addUser,
    myUserId,
    onError,
  ]);

  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      dataChannels.current.clear();
      pendingCandidates.current.clear();
    };
  }, []);

  return { connectedPeers, sendMessage, sendMessageToAll, sendDataToAll };
}
