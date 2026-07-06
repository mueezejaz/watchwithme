import { useState, useEffect, useRef, useCallback } from "react";

export default function useMediaDevices() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [stream, setStream] = useState(null);
  const [soundLevel, setSoundLevel] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const requestPermission = useCallback(async () => {
    setError(null);
    setPermissionDenied(false);
    setIsBlocked(false);

    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      userStream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
      setStream(userStream);
      setPermissionGranted(true);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === "audioinput");
      setDevices(audioInputs);

      if (audioInputs.length > 0 && !selectedDeviceId) {
        const defaultDevice =
          audioInputs.find(
            (d) =>
              d.deviceId === "default" ||
              d.label.toLowerCase().includes("default"),
          ) || audioInputs[0];
        setSelectedDeviceId(defaultDevice.deviceId);
      }
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true);
        try {
          const permStatus = await navigator.permissions.query({ name: "microphone" });
          if (permStatus.state === "denied") {
            setIsBlocked(true);
            setError(
              "Microphone access is blocked. To enable it:\n\n" +
              "Chrome: Settings → Privacy & Security → Site Settings → Microphone\n" +
              "Firefox: Settings → Privacy & Security → Permissions → Microphone\n" +
              "Edge: Settings → Cookies & Site Permissions → Microphone"
            );
          } else {
            setError("Microphone access was denied. Click retry to try again.");
          }
        } catch {
          setPermissionDenied(true);
          setError("Microphone access was denied. Click retry to try again.");
        }
      } else {
        setError(err.message || "Failed to access microphone");
      }
    }
  }, [selectedDeviceId]);

  const toggleMic = useCallback(() => {
    setIsMicOn((prev) => {
      const next = !prev;
      if (stream) {
        stream.getAudioTracks().forEach((track) => (track.enabled = next));
      }
      return next;
    });
  }, [stream]);

  const changeDevice = useCallback(
    async (deviceId) => {
      setSelectedDeviceId(deviceId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        newStream
          .getAudioTracks()
          .forEach((track) => (track.enabled = isMicOn));
        setStream(newStream);
      } catch (err) {
        setError(err.message || "Failed to switch microphone");
      }
    },
    [stream, isMicOn],
  );

  useEffect(() => {
    if (!stream || !isMicOn) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setSoundLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function updateLevel() {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / dataArray.length;
      setSoundLevel(Math.min(avg / 255, 1));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    }

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setSoundLevel(0);
    };
  }, [stream, isMicOn]);

  return {
    devices,
    selectedDeviceId,
    stream,
    soundLevel,
    isMicOn,
    permissionGranted,
    permissionDenied,
    isBlocked,
    error,
    requestPermission,
    toggleMic,
    changeDevice,
  };
}
