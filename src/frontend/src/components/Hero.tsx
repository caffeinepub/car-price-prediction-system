import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIconDance } from "../hooks/useIconDance";

interface HeroProps {
  onPredictionClick: () => void;
}

const HEADLINE_WORDS = ["Accurate", "Instant", "AI-Powered", "Reliable"];

const ORB_CONFIG = [
  {
    size: 500,
    color: "oklch(0.55 0.18 250 / 0.25)",
    top: "-10%",
    left: "-5%",
    cls: "orb-1",
    xDir: 1,
    yDir: 1,
  },
  {
    size: 400,
    color: "oklch(0.65 0.2 280 / 0.2)",
    top: "20%",
    right: "-8%",
    cls: "orb-2",
    xDir: -1,
    yDir: -0.5,
  },
  {
    size: 350,
    color: "oklch(0.6 0.18 200 / 0.2)",
    bottom: "-5%",
    left: "20%",
    cls: "orb-3",
    xDir: 1,
    yDir: 1,
  },
  {
    size: 300,
    color: "oklch(0.7 0.18 320 / 0.15)",
    top: "50%",
    left: "40%",
    cls: "orb-4",
    xDir: -1,
    yDir: -0.5,
  },
  {
    size: 250,
    color: "oklch(0.65 0.2 160 / 0.18)",
    top: "10%",
    left: "50%",
    cls: "orb-5",
    xDir: 1,
    yDir: 1,
  },
  {
    size: 200,
    color: "oklch(0.75 0.18 60 / 0.15)",
    bottom: "20%",
    right: "15%",
    cls: "orb-6",
  },
];

const PARTICLE_CONFIG = Array.from({ length: 15 }, (_, i) => ({
  key: `p${i}`,
  width: (i % 3) + 2,
  height: (i % 3) + 2,
  bg: `oklch(${0.5 + (i % 3) * 0.1} 0.18 ${200 + i * 10})`,
  top: `${(i * 7) % 100}%`,
  left: `${(i * 13) % 100}%`,
  delay: `${(i * 0.3) % 3}s`,
  duration: `${2 + (i % 3)}s`,
}));

export function Hero({ onPredictionClick }: HeroProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [orbOffsets, setOrbOffsets] = useState({ x: 0, y: 0 });
  const handleDance = useIconDance();

  // Typewriter effect
  useEffect(() => {
    const word = HEADLINE_WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping) {
      if (displayText.length < word.length) {
        timeout = setTimeout(() => {
          setDisplayText(word.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 1800);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setWordIndex((prev) => (prev + 1) % HEADLINE_WORDS.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, wordIndex]);

  // Parallax scroll effect on orbs
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setOrbOffsets({ x: scrollY * 0.02, y: scrollY * 0.05 });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToAbout = () => {
    const element = document.getElementById("about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated orb background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ORB_CONFIG.map((orb) => (
          <div
            key={orb.cls}
            className={`orb ${orb.cls}`}
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              top: (orb as any).top,
              left: (orb as any).left,
              right: (orb as any).right,
              bottom: (orb as any).bottom,
              transform: `translate(${orbOffsets.x * (orb.xDir ?? 1)}px, ${orbOffsets.y * (orb.yDir ?? 1)}px)`,
            }}
          />
        ))}

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.55 0.18 250) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.55 0.18 250) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating particles */}
        {PARTICLE_CONFIG.map((p) => (
          <div
            key={p.key}
            className="absolute rounded-full particle-dot"
            style={{
              width: p.width,
              height: p.height,
              background: p.bg,
              top: p.top,
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-bounce-in cursor-pointer select-none"
            onClick={(e) => handleDance(e)}
          >
            <Sparkles className="w-4 h-4 text-primary animate-heartbeat" />
            <span className="text-sm font-medium text-primary">
              Machine Learning Powered
            </span>
            <Star className="w-3.5 h-3.5 text-primary fill-current" />
          </button>

          {/* Main Heading with typewriter */}
          <div className="animate-slide-up-fade stagger-2">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-poppins">
              <span className="block text-foreground">Get</span>
              <span className="block min-h-[1.2em] relative">
                <span className="gradient-text">{displayText}</span>
                <span
                  className="inline-block w-0.5 h-[0.85em] bg-primary ml-1 align-middle"
                  style={{ animation: "cursor-blink 0.8s step-end infinite" }}
                />
              </span>
              <span className="block text-foreground">Car Prices</span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up-fade stagger-3">
            Advanced ML algorithms to predict current and future car prices
            based on vehicle specifications and market trends.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-fade stagger-4">
            <Button
              onClick={(e) => {
                handleDance(e);
                onPredictionClick();
              }}
              onTouchStart={(e) =>
                handleDance(e as unknown as React.TouchEvent)
              }
              size="lg"
              className="ripple-btn bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-lg px-8 py-6 gap-2 animate-pulse-glow group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5 group-hover:animate-heartbeat" />
                Start Prediction
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
            <Button
              onClick={(e) => {
                handleDance(e);
                scrollToAbout();
              }}
              onTouchStart={(e) =>
                handleDance(e as unknown as React.TouchEvent)
              }
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
            >
              <Brain className="w-5 h-5 mr-2 group-hover:animate-heartbeat" />
              Learn More
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 animate-slide-up-fade stagger-5 relative">
            {/* Glow ring behind image */}
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-purple-500/20 to-cyan-500/20 blur-3xl scale-105 animate-pulse-glow pointer-events-none"
              style={{ animationDuration: "4s" }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover-glow-card border border-border/30">
              <img
                src="/assets/generated/car-showroom-hero.dim_1200x600.jpg"
                alt="Car Price Prediction - ML Powered"
                className="w-full max-w-3xl mx-auto animate-float object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating stat cards */}
            <div className="absolute -bottom-4 -left-2 sm:-left-6 bg-card border border-border/50 rounded-2xl p-3 shadow-xl animate-card-enter stagger-6 hover-scale hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                  <p className="text-sm font-bold text-foreground">94.2%</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-2 sm:-right-6 bg-card border border-border/50 rounded-2xl p-3 shadow-xl animate-card-enter stagger-7 hover-scale hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-500 animate-heartbeat" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Speed</p>
                  <p className="text-sm font-bold text-foreground">
                    &lt; 1 sec
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlight Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: Brain,
                color: "text-primary",
                bgColor: "bg-primary/10",
                title: "ML Algorithms",
                desc: "Advanced machine learning models for accurate predictions",
                delay: "stagger-5",
              },
              {
                icon: TrendingUp,
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                title: "Future Forecasts",
                desc: "1, 3, and 5-year price predictions with confidence scores",
                delay: "stagger-6",
              },
              {
                icon: BarChart3,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                title: "Market Analysis",
                desc: "Real-time market trends and depreciation calculations",
                delay: "stagger-7",
              },
            ].map(({ icon: Icon, color, bgColor, title, desc, delay }) => (
              <div
                key={title}
                className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover-glow-card animate-card-stagger-in ${delay} cursor-pointer select-none`}
                onClick={(e) => handleDance(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleDance(e as any);
                }}
                onTouchStart={(e) =>
                  handleDance(e as unknown as React.TouchEvent)
                }
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mx-auto mb-3`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-poppins">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
