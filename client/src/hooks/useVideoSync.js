import { useRef, useCallback, useEffect } from "react";
import { useVideo } from "../context/VideoContext.jsx";

export default function useVideoSync({ sendDataToAll }) {
  const {
    videoId, setVideoId,
    isPlaying, setIsPlaying,
    setCurrentTime,
    playerRef, hasInited, initialTimeRef,
    clearVideo,
  } = useVideo();

  const isRemoteAction = useRef(false);

  const sendVideoSync = useCallback((action, time) => {
    const currentTime = time ?? playerRef.current?.getCurrentTime?.() ?? 0;
    sendDataToAll({ type: "video-sync", action, currentTime, videoId });
  }, [sendDataToAll, playerRef, videoId]);

  const sendChangeVideo = useCallback((newVideoId) => {
    setVideoId(newVideoId);
    setIsPlaying(false);
    hasInited.current = false;
    sendDataToAll({ type: "change-video", videoId: newVideoId });
  }, [sendDataToAll, setVideoId, setIsPlaying, hasInited]);

  const sendSyncRequest = useCallback(() => {
    sendDataToAll({ type: "sync-request" });
  }, [sendDataToAll]);

  const sendSyncResponse = useCallback(() => {
    const time = playerRef.current?.getCurrentTime?.() ?? 0;
    sendDataToAll({ type: "sync-response", videoId, isPlaying, currentTime: time });
  }, [sendDataToAll, playerRef, videoId, isPlaying]);

  const handleDataMessage = useCallback(({ from, data }) => {
    switch (data.type) {
      case "video-sync": {
        if (!data.videoId) break;
        isRemoteAction.current = true;
        if (data.action === "play") {
          setIsPlaying(true);
          playerRef.current?.seekTo(data.currentTime, "seconds");
        } else if (data.action === "pause") {
          setIsPlaying(false);
          playerRef.current?.seekTo(data.currentTime, "seconds");
        } else if (data.action === "seek") {
          playerRef.current?.seekTo(data.currentTime, "seconds");
        }
        setTimeout(() => { isRemoteAction.current = false; }, 2000);
        break;
      }
      case "change-video": {
        isRemoteAction.current = true;
        setVideoId(data.videoId);
        setIsPlaying(false);
        hasInited.current = false;
        setTimeout(() => { isRemoteAction.current = false; }, 2000);
        break;
      }
      case "sync-request": {
        const time = playerRef.current?.getCurrentTime?.() ?? 0;
        sendDataToAll({ type: "sync-response", videoId, isPlaying, currentTime: time });
        break;
      }
      case "sync-response": {
        if (videoId !== null) break;
        isRemoteAction.current = true;
        initialTimeRef.current = data.currentTime;
        setVideoId(data.videoId);
        setIsPlaying(data.isPlaying);
        setTimeout(() => { isRemoteAction.current = false; }, 2000);
        break;
      }
    }
  }, [videoId, isPlaying, setVideoId, setIsPlaying, playerRef, hasInited, sendDataToAll]);

  useEffect(() => {
    if (!videoId) return;
    const timer = setTimeout(sendSyncRequest, 1500);
    return () => clearTimeout(timer);
  }, [videoId]);

  return { handleDataMessage, isRemoteAction, sendVideoSync, sendChangeVideo, sendSyncRequest, clearVideo };
}
