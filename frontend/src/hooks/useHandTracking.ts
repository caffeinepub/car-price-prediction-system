import { useEffect, useRef, useState, RefObject } from 'react';

interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface HandLandmarks {
  landmarks: Landmark[];
  handedness: string;
}

interface UseHandTrackingReturn {
  landmarks: HandLandmarks[] | null;
  isTracking: boolean;
  error: string | null;
}

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isActive: boolean
): UseHandTrackingReturn {
  const [landmarks, setLandmarks] = useState<HandLandmarks[] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const lastVideoTimeRef = useRef(-1);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setIsTracking(false);
      setLandmarks(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const initializeHandTracking = async () => {
      try {
        // Load MediaPipe scripts
        await loadScript(`${MEDIAPIPE_CDN}/hands.js`);

        if (cancelled || !mountedRef.current) return;

        // Wait for Hands to be available on window
        let attempts = 0;
        while (!(window as any).Hands && attempts < 50) {
          await new Promise((r) => setTimeout(r, 100));
          attempts++;
        }

        if (!(window as any).Hands) {
          throw new Error('MediaPipe Hands failed to load');
        }

        if (cancelled || !mountedRef.current) return;

        const HandsClass = (window as any).Hands;
        const hands = new HandsClass({
          locateFile: (file: string) => `${MEDIAPIPE_CDN}/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (cancelled || !mountedRef.current) return;

          const canvas = canvasRef.current;
          const video = videoRef.current;

          if (canvas && video && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const handsData: HandLandmarks[] = results.multiHandLandmarks.map(
                  (handLandmarks: any, idx: number) => ({
                    landmarks: handLandmarks,
                    handedness: results.multiHandedness?.[idx]?.label || 'Unknown',
                  })
                );

                setLandmarks(handsData);

                results.multiHandLandmarks.forEach((handLandmarks: any) => {
                  drawLandmarks(ctx, handLandmarks, canvas.width, canvas.height);
                });
              } else {
                setLandmarks(null);
              }
            }
          }
        });

        if (cancelled || !mountedRef.current) return;

        handsRef.current = hands;
        setError(null);

        // Start detection loop
        const detect = async () => {
          if (cancelled || !mountedRef.current) return;

          const video = videoRef.current;
          if (video && handsRef.current && video.readyState >= 2 && !video.paused) {
            if (video.currentTime !== lastVideoTimeRef.current) {
              lastVideoTimeRef.current = video.currentTime;
              setIsTracking(true);
              try {
                await handsRef.current.send({ image: video });
              } catch (err) {
                // Ignore frame errors
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch (err) {
        console.error('Hand tracking initialization error:', err);
        if (!cancelled && mountedRef.current) {
          setError('Failed to initialize hand tracking. Check your internet connection.');
          setIsTracking(false);
        }
      }
    };

    initializeHandTracking();

    return () => {
      cancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {}
        handsRef.current = null;
      }
      setIsTracking(false);
      setLandmarks(null);
    };
  }, [isActive, videoRef, canvasRef]);

  return { landmarks, isTracking, error };
}

function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[],
  width: number,
  height: number
) {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17],
  ];

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;

  connections.forEach(([start, end]) => {
    const s = landmarks[start];
    const e = landmarks[end];
    ctx.beginPath();
    ctx.moveTo(s.x * width, s.y * height);
    ctx.lineTo(e.x * width, e.y * height);
    ctx.stroke();
  });

  landmarks.forEach((lm, index) => {
    const x = lm.x * width;
    const y = lm.y * height;
    const isTip = [4, 8, 12, 16, 20].includes(index);

    ctx.beginPath();
    ctx.arc(x, y, isTip ? 7 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = isTip ? 'rgba(255, 200, 50, 0.95)' : 'rgba(100, 220, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}
