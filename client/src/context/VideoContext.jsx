import { createContext, useContext, useState, useRef, useCallback } from "react";

const VideoContext = createContext(null);

export function VideoProvider({ children }) {
  const [videoId, setVideoId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const playerRef = useRef(null);
  const hasInited = useRef(false);

  const clearVideo = useCallback(() => {
    setVideoId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    hasInited.current = false;
  }, []);

  return (
    <VideoContext.Provider
      value={{
        videoId,
        setVideoId,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        volume,
        setVolume,
        playerRef,
        hasInited,
        clearVideo,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}
