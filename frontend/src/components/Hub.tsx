import { useRef, useEffect, useCallback, useState } from 'react';
import { Crown, Image, Music, Car, ArrowRight, Sparkles, Flower2, Trophy, Star, Zap, ArrowLeft, UserCheck } from 'lucide-react';
import type { AppView } from '../App';
import { useIconDance } from '../hooks/useIconDance';

interface HubProps {
  onNavigate: (view: AppView) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: number;
  speed: number;
}

const FEATURE_CARDS = [
  {
    id: 'chess' as AppView,
    title: 'Chess Game',
    description: 'Play a full two-player local chess game with legal move highlighting, castling, en passant, and checkmate detection.',
    icon: Crown,
    gradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    badge: 'Game',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    stats: 'Full Chess Rules',
  },
  {
    id: 'my-photo' as AppView,
    title: 'Photo Studio',
    description: 'Upload your photo and apply stunning filters — grayscale, sepia, neon glow, vignette & more.',
    icon: Image,
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/20',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    badge: 'Creative',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    stats: '8 Filters Available',
  },
  {
    id: 'piano' as AppView,
    title: 'Piano',
    description: 'Play a full two-octave piano with your keyboard or mouse. Beautiful synthesized sound.',
    icon: Music,
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    badge: 'Music',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    stats: '2 Octave Range',
  },
  {
    id: 'home' as AppView,
    title: 'Car Price AI',
    description: 'Predict current and future car prices using advanced ML algorithms and market data.',
    icon: Car,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    badge: 'AI',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    stats: '94% Accuracy',
  },
  {
    id: 'depression-relief' as AppView,
    title: 'Wellness Hub',
    description: 'Mood lifter & stress relief — affirmations, breathing exercises, and feel-good activities to brighten your day.',
    icon: Flower2,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    badge: 'Wellness',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    stats: 'Mental Wellness',
  },
  {
    id: 'attendance' as AppView,
    title: 'Attendance Monitor',
    description: 'Face recognition attendance tracking — register faces and automatically log attendance in real time.',
    icon: UserCheck,
    gradient: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    badge: 'AI Vision',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    stats: 'Face Recognition',
  },
];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 80;
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      hue: 200 + (i % 5) * 30,
      speed: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${(p1.hue + p2.hue) / 2}, 70%, 65%, ${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      particlesRef.current.forEach((p) => {
        p.x += p.vx * p.speed;
        p.y += p.vy * p.speed;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      aria-hidden="true"
    />
  );
}

interface TiltCardProps {
  card: typeof FEATURE_CARDS[0];
  index: number;
  onNavigate: (view: AppView) => void;
  visible: boolean;
}

function TiltCard({ card, index, onNavigate, visible }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const handleDance = useIconDance();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -10, y: dx * 10 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  const Icon = card.icon;

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} backdrop-blur-sm p-6 cursor-pointer overflow-hidden transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transform: visible
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.04 : 1}) translateY(0)`
          : 'translateY(40px) scale(0.95)',
        transition: hovered
          ? 'transform 0.1s ease-out, opacity 0.5s ease, box-shadow 0.3s ease'
          : 'transform 0.4s ease-out, opacity 0.5s ease, box-shadow 0.3s ease',
        boxShadow: hovered
          ? `0 20px 60px -10px rgba(120,220,232,0.3), 0 0 0 1px rgba(255,255,255,0.1)`
          : '0 4px 20px rgba(0,0,0,0.15)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        handleDance(e);
        onNavigate(card.id);
      }}
      onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
    >
      {/* Glow border on hover */}
      {hovered && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none hub-card-glow-border" />
      )}

      {/* Shimmer overlay on hover */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 animate-shimmer-sweep" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
          {card.badge}
        </span>
        <ArrowRight className={`w-4 h-4 ${card.iconColor} transition-transform duration-200 ${hovered ? 'translate-x-1' : ''}`} />
      </div>

      <div className={`w-14 h-14 rounded-xl ${card.iconBg} border border-white/10 flex items-center justify-center mb-4 transition-all duration-300 ${hovered ? 'scale-110 rotate-3' : ''}`}>
        <Icon className={`w-7 h-7 ${card.iconColor}`} />
      </div>

      <h3 className="text-foreground text-xl font-bold mb-2 font-poppins">{card.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{card.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{card.stats}</span>
        <span className={`text-xs font-medium ${card.iconColor} flex items-center gap-1 ${hovered ? 'gap-2' : ''} transition-all duration-200`}>
          Open
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

export function Hub({ onNavigate }: HubProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const handleDance = useIconDance();

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards((prev) => new Set([...prev, i]));
            }, i * 100);
            obs.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(ref);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden py-20 px-4">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: 'url(/assets/generated/hub-background.dim_1920x1080.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />

      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1 w-96 h-96 -top-20 -left-20" style={{ background: 'radial-gradient(circle, oklch(0.55 0.18 250 / 0.2), transparent 70%)' }} />
        <div className="orb orb-3 w-80 h-80 bottom-0 right-0" style={{ background: 'radial-gradient(circle, oklch(0.6 0.18 200 / 0.15), transparent 70%)' }} />
        <div className="orb orb-5 w-64 h-64 top-1/2 left-1/2" style={{ background: 'radial-gradient(circle, oklch(0.65 0.2 280 / 0.12), transparent 70%)' }} />
      </div>

      <ParticleCanvas />

      <div className="relative z-10 container mx-auto max-w-5xl">
        {/* Back button */}
        <button
          onClick={(e) => { handleDance(e); onNavigate('home'); }}
          onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 mb-8 group hover-scale"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-bounce-in cursor-pointer"
            onClick={(e) => handleDance(e)}
            onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
          >
            <Sparkles className="w-4 h-4 animate-heartbeat" />
            Mini Applications
          </div>
          <h1 className="text-5xl sm:text-6xl font-black font-poppins mb-4">
            <span className="gradient-text">App Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our collection of interactive mini-apps — games, creative tools, and wellness features.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { icon: Trophy, label: '6 Apps', color: 'text-amber-500' },
              { icon: Star, label: 'Free Forever', color: 'text-yellow-500' },
              { icon: Zap, label: 'Instant Access', color: 'text-blue-500' },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-2 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[i] = el; }}
            >
              <TiltCard
                card={card}
                index={i}
                onNavigate={onNavigate}
                visible={visibleCards.has(i)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
