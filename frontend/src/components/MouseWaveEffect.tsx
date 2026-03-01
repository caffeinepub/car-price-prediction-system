import { useEffect, useRef } from 'react';

interface Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  createdAt: number;
  duration: number;
  colorIndex: number;
  ringOffset: number;
}

// Color palette: teal → cyan → violet → magenta
const WAVE_COLORS = [
  { r: 45, g: 212, b: 191 },   // teal
  { r: 99, g: 179, b: 237 },   // sky blue
  { r: 167, g: 139, b: 250 },  // violet
  { r: 236, g: 72, b: 153 },   // pink
  { r: 251, g: 191, b: 36 },   // amber
];

/**
 * Full-viewport canvas overlay that renders expanding multi-ring light-wave
 * effects wherever the mouse moves. pointer-events: none so it never blocks clicks.
 * Spawns 3 concentric rings per mouse move with color variation.
 */
export function MouseWaveEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<Wave[]>([]);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const colorIndexRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < 35) return;
      lastSpawnRef.current = now;

      const baseColorIdx = colorIndexRef.current % WAVE_COLORS.length;
      colorIndexRef.current++;

      // Spawn 3 concentric rings with staggered sizes and timing
      for (let ring = 0; ring < 3; ring++) {
        wavesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: ring * 8,
          maxRadius: 55 + ring * 35 + Math.random() * 25,
          alpha: 0.65 - ring * 0.12,
          createdAt: now + ring * 30,
          duration: 500 + ring * 120 + Math.random() * 100,
          colorIndex: (baseColorIdx + ring) % WAVE_COLORS.length,
          ringOffset: ring,
        });
      }

      // Cap simultaneous waves
      if (wavesRef.current.length > 60) {
        wavesRef.current.splice(0, wavesRef.current.length - 60);
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      wavesRef.current = wavesRef.current.filter((w) => {
        const elapsed = now - w.createdAt;
        if (elapsed < 0) return true; // not started yet
        if (elapsed >= w.duration) return false;

        const progress = elapsed / w.duration;
        const eased = 1 - Math.pow(1 - progress, 2.5);
        const currentRadius = w.radius + (w.maxRadius - w.radius) * eased;
        const alpha = w.alpha * (1 - progress) * (1 - progress);

        const color = WAVE_COLORS[w.colorIndex];
        const nextColor = WAVE_COLORS[(w.colorIndex + 1) % WAVE_COLORS.length];

        // Outer radial gradient ring
        const gradient = ctx.createRadialGradient(
          w.x, w.y, currentRadius * 0.45,
          w.x, w.y, currentRadius,
        );
        gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0)`);
        gradient.addColorStop(0.5, `rgba(${color.r},${color.g},${color.b},${alpha * 0.5})`);
        gradient.addColorStop(0.8, `rgba(${nextColor.r},${nextColor.g},${nextColor.b},${alpha * 0.9})`);
        gradient.addColorStop(1, `rgba(${nextColor.r},${nextColor.g},${nextColor.b},0)`);

        ctx.beginPath();
        ctx.arc(w.x, w.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Crisp ring stroke with color blend
        const strokeAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.arc(w.x, w.y, currentRadius * 0.78, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${strokeAlpha})`;
        ctx.lineWidth = 1.5 - w.ringOffset * 0.3;
        ctx.stroke();

        // Inner bright dot at center for first ring only
        if (w.ringOffset === 0 && progress < 0.3) {
          const dotAlpha = alpha * (1 - progress / 0.3) * 0.8;
          ctx.beginPath();
          ctx.arc(w.x, w.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${dotAlpha})`;
          ctx.fill();
        }

        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
      aria-hidden="true"
    />
  );
}
