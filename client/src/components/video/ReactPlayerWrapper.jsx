import { useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import { useVideo } from "../../context/VideoContext.jsx";

export default function ReactPlayerWrapper({ isRemoteAction, sendVideoSync, onReady }) {
  const { videoId, isPlaying, volume, playerRef } = useVideo();
  const readyRef = useRef(false);

  const handlePlay = useCallback(() => {
    if (isRemoteAction.current) return;
    sendVideoSync("play");
  }, [isRemoteAction, sendVideoSync]);

  const handlePause = useCallback(() => {
    if (isRemoteAction.current) return;
    sendVideoSync("pause");
  }, [isRemoteAction, sendVideoSync]);

  const handleSeeked = useCallback(() => {
    if (isRemoteAction.current) return;
    sendVideoSync("seek");
  }, [isRemoteAction, sendVideoSync]);

  const handleReady = useCallback(() => {
    readyRef.current = true;
    onReady?.();
  }, [onReady]);

  if (!videoId) return null;

  return (
    <div className="relative aspect-video w-full bg-black overflow-hidden rounded-lg">
      <ReactPlayer
        key={videoId}
        ref={playerRef}
        src={`https://www.youtube.com/watch?v=${videoId}`}
        playing={isPlaying}
        volume={volume}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onReady={handleReady}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        config={{
          youtube: {
            playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
          },
        }}
      />
    </div>
  );
}
