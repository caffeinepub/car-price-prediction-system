import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Heart, RefreshCw, Wind, Smile, Flower2, Sun, Music, BookOpen, Coffee, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIconDance } from '../hooks/useIconDance';

interface DepressionReliefProps {
  onBack: () => void;
}

const AFFIRMATIONS = [
  "You are stronger than you think. Every storm runs out of rain. 🌈",
  "This feeling is temporary. You have survived hard days before. 💪",
  "You are worthy of love, peace, and happiness. 🌸",
  "Small steps still move you forward. Be proud of every effort. 🌱",
  "You don't have to be perfect to be amazing. 🌟",
  "Breathe. You are exactly where you need to be right now. 🍃",
  "Your feelings are valid. It's okay to not be okay sometimes. 💛",
  "You have the power to create change in your life. 🦋",
  "Every day is a new beginning. Today can be different. ☀️",
  "You are not alone. Millions of hearts beat alongside yours. 🤝",
  "Healing is not linear. Be gentle with yourself. 🌺",
  "You matter more than you know. The world is better with you in it. 💖",
];

const ACTIVITIES = [
  { emoji: '🚶', text: 'Take a 10-minute walk outside in fresh air' },
  { emoji: '🎵', text: 'Listen to your favorite uplifting music' },
  { emoji: '📓', text: 'Write 3 things you are grateful for today' },
  { emoji: '🧘', text: 'Try a 5-minute guided meditation' },
  { emoji: '📞', text: 'Call or text a friend or family member' },
  { emoji: '🍵', text: 'Make yourself a warm cup of tea or coffee' },
  { emoji: '🎨', text: 'Draw, color, or doodle freely for 10 minutes' },
  { emoji: '🌿', text: 'Spend time with a plant or in nature' },
  { emoji: '🛁', text: 'Take a warm, relaxing shower or bath' },
  { emoji: '📚', text: 'Read a few pages of an inspiring book' },
  { emoji: '🐾', text: 'Cuddle with a pet or watch cute animal videos' },
  { emoji: '💃', text: 'Dance to one song — no one is watching!' },
];

const MOOD_SCALE = [
  { value: 1, emoji: '😔', label: 'Very Low', color: 'bg-red-500/20 border-red-400/50 text-red-300' },
  { value: 2, emoji: '😕', label: 'Low', color: 'bg-orange-500/20 border-orange-400/50 text-orange-300' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'bg-lime-500/20 border-lime-400/50 text-lime-300' },
  { value: 5, emoji: '😄', label: 'Great', color: 'bg-green-500/20 border-green-400/50 text-green-300' },
];

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATH_CYCLE: { phase: BreathPhase; duration: number; label: string; instruction: string }[] = [
  { phase: 'inhale', duration: 4000, label: 'Inhale', instruction: 'Breathe in slowly through your nose...' },
  { phase: 'hold', duration: 4000, label: 'Hold', instruction: 'Hold your breath gently...' },
  { phase: 'exhale', duration: 6000, label: 'Exhale', instruction: 'Breathe out slowly through your mouth...' },
  { phase: 'rest', duration: 2000, label: 'Rest', instruction: 'Relax and prepare for the next breath...' },
];

function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentPhase = BREATH_CYCLE[phaseIndex];

  const runPhase = (idx: number) => {
    const phase = BREATH_CYCLE[idx];
    setPhaseIndex(idx);
    setProgress(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / phase.duration) * 100, 100));
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      const next = (idx + 1) % BREATH_CYCLE.length;
      runPhase(next);
    }, phase.duration);
  };

  const handleStart = () => {
    setIsActive(true);
    runPhase(0);
  };

  const handleStop = () => {
    setIsActive(false);
    clearTimeout(timerRef.current!);
    clearInterval(intervalRef.current!);
    setPhaseIndex(0);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current!);
      clearInterval(intervalRef.current!);
    };
  }, []);

  const circleScale =
    currentPhase.phase === 'inhale'
      ? 1 + (progress / 100) * 0.4
      : currentPhase.phase === 'exhale'
      ? 1.4 - (progress / 100) * 0.4
      : currentPhase.phase === 'hold'
      ? 1.4
      : 1;

  const phaseColors: Record<BreathPhase, string> = {
    inhale: 'from-teal-400/40 to-emerald-400/40',
    hold: 'from-violet-400/40 to-purple-400/40',
    exhale: 'from-amber-400/40 to-orange-400/40',
    rest: 'from-slate-400/20 to-slate-500/20',
  };

  const glowColors: Record<BreathPhase, string> = {
    inhale: '0 0 40px 15px rgba(52,211,153,0.4), 0 0 80px 30px rgba(52,211,153,0.2)',
    hold: '0 0 40px 15px rgba(167,139,250,0.4), 0 0 80px 30px rgba(167,139,250,0.2)',
    exhale: '0 0 40px 15px rgba(251,191,36,0.4), 0 0 80px 30px rgba(251,191,36,0.2)',
    rest: '0 0 20px 5px rgba(148,163,184,0.2)',
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Outer glow rings */}
        {isActive && (
          <>
            <div
              className={`absolute rounded-full border border-white/10 transition-all duration-1000`}
              style={{
                width: `${isActive ? circleScale * 180 : 180}px`,
                height: `${isActive ? circleScale * 180 : 180}px`,
                boxShadow: isActive ? glowColors[currentPhase.phase] : 'none',
                transition: 'width 0.1s linear, height 0.1s linear, box-shadow 0.5s ease',
              }}
            />
            <div
              className={`absolute rounded-full border border-white/5 transition-all duration-1000`}
              style={{
                width: `${isActive ? circleScale * 200 : 200}px`,
                height: `${isActive ? circleScale * 200 : 200}px`,
                transition: 'width 0.1s linear, height 0.1s linear',
              }}
            />
          </>
        )}

        {/* Main breathing circle */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${phaseColors[currentPhase.phase]} border border-white/20 transition-all`}
          style={{
            width: `${isActive ? circleScale * 160 : 160}px`,
            height: `${isActive ? circleScale * 160 : 160}px`,
            transition: 'width 0.1s linear, height 0.1s linear, box-shadow 0.5s ease',
            boxShadow: isActive ? glowColors[currentPhase.phase] : 'none',
          }}
        />
        {/* Inner circle */}
        <div className="relative z-10 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm">
          <Wind className="w-8 h-8 text-teal-300 mb-1 animate-heartbeat" />
          <span className="text-foreground font-bold text-sm">
            {isActive ? currentPhase.label : 'Ready'}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="text-center animate-affirmation-in">
          <p className="text-muted-foreground text-sm italic">{currentPhase.instruction}</p>
          <div className="mt-3 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all"
              style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
            />
          </div>
        </div>
      )}

      {!isActive && (
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          4-4-6 breathing: inhale 4s, hold 4s, exhale 6s. Activates your calm response.
        </p>
      )}

      <Button
        onClick={isActive ? handleStop : handleStart}
        className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
          isActive
            ? 'bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30'
            : 'bg-teal-500/20 border border-teal-400/50 text-teal-300 hover:bg-teal-500/30'
        }`}
        variant="ghost"
      >
        {isActive ? 'Stop Exercise' : 'Start Breathing'}
      </Button>
    </div>
  );
}

export function DepressionRelief({ onBack }: DepressionReliefProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [visibleActivities, setVisibleActivities] = useState<Set<number>>(new Set());
  const activityRefs = useRef<(HTMLDivElement | null)[]>([]);
  const handleDance = useIconDance();

  const handleNextQuote = () => {
    setQuoteVisible(false);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
      setQuoteVisible(true);
    }, 400);
  };

  // Auto-cycle affirmations
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
        setQuoteVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for activity cards
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    activityRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleActivities((prev) => new Set([...prev, i]));
            }, i * 60);
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

  const selectedMoodData = MOOD_SCALE.find((m) => m.value === selectedMood);

  return (
    <section className="relative min-h-screen py-12 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient-cycle"
        style={{
          background: 'linear-gradient(135deg, oklch(0.95 0.04 160), oklch(0.93 0.04 200), oklch(0.95 0.03 280), oklch(0.94 0.04 120), oklch(0.95 0.04 160))',
        }}
      />

      {/* Soft orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1 w-96 h-96 -top-20 -left-20 opacity-30" style={{ background: 'radial-gradient(circle, oklch(0.7 0.15 160 / 0.4), transparent 70%)' }} />
        <div className="orb orb-3 w-80 h-80 bottom-0 right-0 opacity-25" style={{ background: 'radial-gradient(circle, oklch(0.65 0.15 200 / 0.35), transparent 70%)' }} />
        <div className="orb orb-5 w-64 h-64 top-1/3 left-1/2 opacity-20" style={{ background: 'radial-gradient(circle, oklch(0.7 0.12 280 / 0.3), transparent 70%)' }} />
      </div>

      <div className="relative z-10 container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={(e) => { handleDance(e); onBack(); }}
            onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group hover-scale"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Hub</span>
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-12 animate-slide-up-fade">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 border border-emerald-400/30 mb-6 animate-pulse-glow" style={{ animationDuration: '3s' }}>
            <span className="text-4xl animate-heartbeat">🌸</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-foreground mb-3">
            Depression{' '}
            <span className="gradient-text">
              Relief
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            A gentle space to lift your mood, breathe, and find calm. You are not alone. 💛
          </p>
        </div>

        {/* Decorative image */}
        <div className="w-full rounded-2xl overflow-hidden mb-10 border border-border/30 shadow-xl hover-glow-card animate-card-enter stagger-2">
          <img
            src="/assets/generated/depression-relief-thumb.dim_400x300.png"
            alt="Depression Relief"
            className="w-full object-cover max-h-48"
          />
        </div>

        {/* Mood Check-In */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-6 hover-glow-card animate-card-enter stagger-3">
          <div className="flex items-center gap-3 mb-5">
            <Smile className="w-5 h-5 text-amber-400 animate-heartbeat" />
            <h2 className="text-foreground font-bold text-xl font-poppins">How are you feeling right now?</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {MOOD_SCALE.map((mood) => (
              <button
                key={mood.value}
                onClick={(e) => { handleDance(e); setSelectedMood(mood.value); }}
                onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
                className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border transition-all duration-300 ${
                  selectedMood === mood.value
                    ? `${mood.color} scale-110 shadow-lg`
                    : 'bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50 hover:scale-105'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
          {selectedMoodData && (
            <div className="mt-5 text-center animate-affirmation-in">
              <p className="text-muted-foreground text-sm">
                {selectedMood! <= 2
                  ? "It's okay to feel this way. Try the breathing exercise below — it really helps. 💙"
                  : selectedMood === 3
                  ? "Neutral is okay! A little activity or affirmation can brighten your day. 🌤️"
                  : "Wonderful! Keep nurturing that positive energy. 🌟"}
              </p>
            </div>
          )}
        </div>

        {/* Affirmations */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-6 hover-glow-card animate-card-enter stagger-4">
          <div className="flex items-center gap-3 mb-5">
            <Heart className="w-5 h-5 text-rose-400 animate-heartbeat" />
            <h2 className="text-foreground font-bold text-xl font-poppins">Daily Affirmation</h2>
          </div>
          <div
            className="min-h-[80px] flex items-center justify-center text-center px-4"
            style={{
              opacity: quoteVisible ? 1 : 0,
              transform: quoteVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <p className="text-foreground text-lg leading-relaxed font-medium italic">
              "{AFFIRMATIONS[quoteIndex]}"
            </p>
          </div>
          <div className="flex justify-center mt-5">
            <Button
              onClick={(e) => { handleDance(e); handleNextQuote(); }}
              onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
              variant="ghost"
              className="flex items-center gap-2 bg-rose-500/10 border border-rose-400/30 text-rose-400 hover:bg-rose-500/20 rounded-full px-6 transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Next Affirmation
            </Button>
          </div>
          {/* Dots indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {AFFIRMATIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuoteVisible(false);
                  setTimeout(() => { setQuoteIndex(i); setQuoteVisible(true); }, 300);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === quoteIndex ? 'bg-rose-400 w-4' : 'bg-border w-1.5 hover:bg-rose-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Breathing Exercise */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-6 hover-glow-card animate-card-enter stagger-5">
          <div className="flex items-center gap-3 mb-6">
            <Wind className="w-5 h-5 text-teal-400" />
            <h2 className="text-foreground font-bold text-xl font-poppins">Breathing Exercise</h2>
          </div>
          <BreathingExercise />
        </div>

        {/* Feel Good Activities */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover-glow-card animate-card-enter stagger-6">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-amber-400 animate-heartbeat" />
            <h2 className="text-foreground font-bold text-xl font-poppins">Feel Good Activities</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-5">
            Pick one activity and do it right now. Small actions create big shifts. 🌱
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACTIVITIES.map((activity, i) => (
              <div
                key={i}
                ref={(el) => { activityRefs.current[i] = el; }}
                className={`flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-emerald-400/30 transition-all duration-300 cursor-default group ${
                  visibleActivities.has(i)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="text-xl flex-shrink-0 group-hover:scale-125 transition-transform duration-300">
                  {activity.emoji}
                </span>
                <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-200">
                  {activity.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center animate-slide-up-fade">
          <p className="text-muted-foreground text-xs">
            If you're in crisis, please reach out to a mental health professional or helpline. You deserve support. 💙
          </p>
        </div>
      </div>
    </section>
  );
}
