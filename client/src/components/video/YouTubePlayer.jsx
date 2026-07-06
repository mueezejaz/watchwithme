import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

let apiPromise = null;

function loadAPI() {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = resolve;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return apiPromise;
}

const YouTubePlayer = forwardRef(function YouTubePlayer(
  { videoId, playing, volume, initialTimeRef, onPlay, onPause, onSeeked, onReady, onError },
  ref
) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const suppressSeekRef = useRef(false);

  const callbacksRef = useRef({ onPlay, onPause, onSeeked, onReady, onError });
  callbacksRef.current = { onPlay, onPause, onSeeked, onReady, onError };

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
    getDuration: () => playerRef.current?.getDuration() ?? 0,
    seekTo: (seconds) => playerRef.current?.seekTo(seconds, true),
    getInternalPlayer: () => playerRef.current,
  }), []);

  useEffect(() => {
    if (!videoId) return;
    readyRef.current = false;
    let cancelled = false;
    let player = null;

    const cb = callbacksRef.current;

    loadAPI().then(() => {
      if (cancelled) return;

      player = new YT.Player(containerRef.current, {
        videoId,
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            playerRef.current = player;
            player.setVolume((volume ?? 1) * 100);
            readyRef.current = true;
            callbacksRef.current.onReady?.();
            if (initialTimeRef?.current != null) {
              suppressSeekRef.current = true;
              try { player.seekTo(initialTimeRef.current, true); } catch {}
              initialTimeRef.current = null;
            }
            if (playingRef.current) {
              try { player.playVideo(); } catch {}
            }
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              callbacksRef.current.onPlay?.();
            } else if (e.data === YT.PlayerState.PAUSED) {
              callbacksRef.current.onPause?.();
            }
          },
          onError: () => callbacksRef.current.onError?.(),
        },
      });
    });

    return () => {
      cancelled = true;
      if (player) {
        player.destroy();
      }
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    if (playing) {
      try { p.playVideo(); } catch {}
    } else {
      try { p.pauseVideo(); } catch {}
    }
  }, [playing]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    try { p.setVolume((volume ?? 1) * 100); } catch {}
  }, [volume]);

  useEffect(() => {
    let lastTime = 0;
    let lastWall = Date.now();

    const poll = setInterval(() => {
      const p = playerRef.current;
      if (!p || !readyRef.current || typeof p.getCurrentTime !== "function") return;

      const currentTime = p.getCurrentTime();
      const now = Date.now();

      if (suppressSeekRef.current) {
        suppressSeekRef.current = false;
        lastTime = currentTime;
        lastWall = now;
        return;
      }

      const wallDelta = (now - lastWall) / 1000;
      const timeDelta = Math.abs(currentTime - lastTime);

      if (lastTime > 0 && timeDelta > 2 && timeDelta > wallDelta * 1.2 + 0.5) {
        callbacksRef.current.onSeeked?.();
      }

      lastTime = currentTime;
      lastWall = now;
    }, 200);

    return () => clearInterval(poll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    />
  );
});

export default YouTubePlayer;
