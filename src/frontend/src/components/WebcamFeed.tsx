import { AlertCircle, Camera, CameraOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useHandTracking } from "../hooks/useHandTracking";
import { Button } from "./ui/button";

// Inline gesture detection (replaces deleted gestureRecognition util)
interface HandLandmark {
  x: number;
  y: number;
  z: number;
}
interface HandData {
  landmarks: HandLandmark[];
  handedness: string;
}

function detectGesture(hands: HandData[]): string[] {
  const notes: string[] = [];
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerBases = [2, 6, 10, 14, 18];
  const noteMap = ["C4", "D4", "E4", "F4", "G4"];
  for (const hand of hands) {
    const lm = hand.landmarks;
    for (let f = 0; f < 5; f++) {
      const tip = lm[fingerTips[f]];
      const base = lm[fingerBases[f]];
      if (tip && base && tip.y < base.y - 0.04) {
        if (!notes.includes(noteMap[f])) notes.push(noteMap[f]);
      }
    }
  }
  return notes;
}

interface WebcamFeedProps {
  onActiveNotesChange: (notes: string[]) => void;
  volume: number;
}

export function WebcamFeed({ onActiveNotesChange, volume }: WebcamFeedProps) {
  const previousNotesRef = useRef<Set<string>>(new Set());
  const [fps, setFps] = useState(0);

  const {
    playNote,
    stopNote,
    setVolume,
    isLoading: audioLoading,
    loadError,
  } = useAudioPlayer();

  const {
    isActive: cameraActive,
    isSupported: cameraSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "user",
    width: 1280,
    height: 720,
  });

  const {
    landmarks,
    isTracking,
    error: trackingError,
  } = useHandTracking(videoRef, canvasRef, cameraActive);

  // Update volume
  useEffect(() => {
    setVolume(volume);
  }, [volume, setVolume]);

  // Gesture detection and audio playback
  useEffect(() => {
    if (!landmarks || landmarks.length === 0) {
      // Stop all notes when no hands detected
      for (const note of previousNotesRef.current) stopNote(note);
      previousNotesRef.current.clear();
      onActiveNotesChange([]);
      return;
    }

    const activeNotes = detectGesture(landmarks);
    const activeNotesSet = new Set<string>(activeNotes);

    // Start new notes
    for (const note of activeNotes) {
      if (!previousNotesRef.current.has(note)) {
        playNote(note);
      }
    }

    // Stop notes that are no longer active
    for (const note of previousNotesRef.current) {
      if (!activeNotesSet.has(note)) {
        stopNote(note);
      }
    }

    previousNotesRef.current = activeNotesSet as Set<string>;
    onActiveNotesChange(activeNotes);
  }, [landmarks, playNote, stopNote, onActiveNotesChange]);

  // FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const updateFps = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      animId = requestAnimationFrame(updateFps);
    };

    animId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (cameraSupported === false) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
        <CameraOff className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <p className="text-white text-lg">
          Camera not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-white text-xl font-semibold">Camera Feed</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {audioLoading && (
            <span className="text-sm text-yellow-300">Loading audio...</span>
          )}
          {loadError && (
            <span
              className="text-xs text-orange-300 max-w-[200px] truncate"
              title={loadError}
            >
              🎵 Synth mode
            </span>
          )}
          {cameraActive && (
            <span className="text-sm text-white/70">FPS: {fps}</span>
          )}
          <span
            className={`text-sm font-medium ${isTracking ? "text-green-300" : "text-white/50"}`}
          >
            {isTracking ? "🟢 Hand detected" : "⚪ No hands"}
          </span>
        </div>
      </div>

      {/* Camera preview */}
      <div
        className="relative bg-black rounded-xl overflow-hidden"
        style={{ aspectRatio: "16/9", minHeight: "240px" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }} // Mirror for natural feel
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ transform: "scaleX(-1)" }} // Mirror canvas to match video
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <p className="text-white/70 text-sm">
                Click "Start Camera" to begin
              </p>
            </div>
          </div>
        )}

        {cameraActive && !isTracking && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-black/60 text-white/80 text-xs px-3 py-1 rounded-full">
              Show your hand to the camera
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={cameraActive ? stopCamera : startCamera}
          disabled={cameraLoading}
          variant={cameraActive ? "destructive" : "default"}
          className="flex-1"
        >
          {cameraLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Initializing...
            </span>
          ) : cameraActive ? (
            <span className="flex items-center gap-2">
              <VideoOff className="w-4 h-4" />
              Stop Camera
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Start Camera
            </span>
          )}
        </Button>
      </div>

      {/* Errors */}
      {cameraError && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">
            <strong>Camera Error:</strong> {cameraError.message}
          </p>
        </div>
      )}

      {trackingError && (
        <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-200 text-sm">
            <strong>Tracking:</strong> {trackingError}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-white/70 text-xs text-center">
          💡 Move your hand left/right across the frame to change notes. Extend
          2+ fingers to play.
        </p>
      </div>
    </div>
  );
}
