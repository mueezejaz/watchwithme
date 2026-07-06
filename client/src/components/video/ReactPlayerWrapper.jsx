import { useRef, useCallback, useEffect } from "react";
import { useVideo } from "../../context/VideoContext.jsx";
import YouTubePlayer from "./YouTubePlayer.jsx";

export default function ReactPlayerWrapper({ isRemoteAction, sendVideoSync, onReady }) {
  const { videoId, isPlaying, setIsPlaying, volume, playerRef, initialTimeRef } = useVideo();
  const wrapperRef = useRef(null);

  const handlePlay = useCallback(() => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    setIsPlaying(true);
    sendVideoSync("play");
  }, [isRemoteAction, sendVideoSync, setIsPlaying]);

  const handlePause = useCallback(() => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    setIsPlaying(false);
    sendVideoSync("pause");
  }, [isRemoteAction, sendVideoSync, setIsPlaying]);

  const handleSeeked = useCallback(() => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    sendVideoSync("seek");
  }, [isRemoteAction, sendVideoSync]);

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    const player = playerRef.current;
    if (!player || !wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftSide = x < rect.width / 2;

    const currentTime = player.getCurrentTime?.() ?? 0;
    const duration = player.getDuration?.() ?? Infinity;
    const newTime = isLeftSide
      ? Math.max(0, currentTime - 10)
      : Math.min(duration, currentTime + 10);

    isRemoteAction.current = true;
    player.seekTo(newTime, "seconds");
    sendVideoSync("seek", newTime);
    setTimeout(() => { isRemoteAction.current = false; }, 300);
  }, [isRemoteAction, playerRef, sendVideoSync]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const player = playerRef.current;
      if (!player) return;

      const currentTime = player.getCurrentTime?.() ?? 0;
      const duration = player.getDuration?.() ?? Infinity;
      const newTime = e.key === "ArrowLeft"
        ? Math.max(0, currentTime - 10)
        : Math.min(duration, currentTime + 10);

      isRemoteAction.current = true;
      player.seekTo(newTime, "seconds");
      sendVideoSync("seek", newTime);
      setTimeout(() => { isRemoteAction.current = false; }, 300);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRemoteAction, playerRef, sendVideoSync]);

  if (!videoId) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-video w-full bg-black overflow-hidden rounded-lg"
      onDoubleClick={handleDoubleClick}
    >
      <YouTubePlayer
        ref={playerRef}
        videoId={videoId}
        playing={isPlaying}
        volume={volume}
        initialTimeRef={initialTimeRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onReady={onReady}
      />
    </div>
  );
}
