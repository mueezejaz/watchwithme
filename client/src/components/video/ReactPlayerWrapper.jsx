import { useRef, useCallback, useEffect, useState } from "react";
import { useVideo } from "../../context/VideoContext.jsx";
import YouTubePlayer from "./YouTubePlayer.jsx";
import { MessageIcon, MaximizeIcon, MinimizeIcon } from "../../lib/icons.jsx";

export default function ReactPlayerWrapper({
  isRemoteAction, sendVideoSync, onReady,
  isFullscreen, showSidebarInFullscreen, onToggleSidebar, onToggleFullscreen,
}) {
  const { videoId, isPlaying, setIsPlaying, volume, playerRef, initialTimeRef } = useVideo();
  const wrapperRef = useRef(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const inactivityTimerRef = useRef(null);

  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  }, []);

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

  useEffect(() => {
    if (!isFullscreen) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      setControlsVisible(true);
      return;
    }

    resetInactivityTimer();

    const handleKeyActivity = () => resetInactivityTimer();
    window.addEventListener("keydown", handleKeyActivity);

    return () => {
      window.removeEventListener("keydown", handleKeyActivity);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isFullscreen, resetInactivityTimer]);

  if (!videoId) return null;

  return (
    <div
      ref={wrapperRef}
      className={`relative bg-black overflow-hidden ${isFullscreen ? "h-full w-full" : "aspect-video w-full rounded-lg group"}`}
      onDoubleClick={handleDoubleClick}
      onMouseMove={resetInactivityTimer}
      onMouseDown={resetInactivityTimer}
      onTouchStart={resetInactivityTimer}
    >
      <div
        className="absolute inset-0"
        style={{ pointerEvents: isFullscreen && !controlsVisible ? "none" : undefined }}
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

      {isFullscreen && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSidebar?.(); }}
          className={`absolute bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${!controlsVisible ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          title={showSidebarInFullscreen ? "Close sidebar" : "Open sidebar"}
        >
          <MessageIcon size={22} />
        </button>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onToggleFullscreen?.(); }}
        className={`absolute bottom-2 right-2 z-30 flex h-9 w-9 items-center justify-center rounded-md bg-black/60 text-white transition-opacity hover:bg-black/80 ${isFullscreen ? (controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none") : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
      </button>
    </div>
  );
}
