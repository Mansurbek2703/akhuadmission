"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   Premium Glass Effect Animated Background
   - Highly realistic glass reflections and refractions
   - Significantly increased particles, lines, and circles
   - Vibrant contrasting colors for visual impact
   - Smooth, elegant movements with depth perception
   - Mesmerizing, high-fidelity aesthetic
   ============================================================ */

const KEYFRAMES = `
@keyframes glass-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-15px) rotate(1.5deg) scale(1.02); }
  50% { transform: translateY(-25px) rotate(3deg) scale(1.04); }
  75% { transform: translateY(-10px) rotate(1deg) scale(1.01); }
}
@keyframes glass-float-reverse {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(12px) rotate(-1deg) scale(1.01); }
  50% { transform: translateY(20px) rotate(-2.5deg) scale(1.03); }
  75% { transform: translateY(8px) rotate(-0.5deg) scale(1.02); }
}
@keyframes glass-float-alt {
  0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
  33% { transform: translateY(-18px) translateX(10px) rotate(2deg); }
  66% { transform: translateY(-8px) translateX(-8px) rotate(-1deg); }
}
@keyframes shimmer-flow {
  0% { transform: translateX(-150%) rotate(25deg); opacity: 0; }
  20% { opacity: 0.6; }
  80% { opacity: 0.6; }
  100% { transform: translateX(250%) rotate(25deg); opacity: 0; }
}
@keyframes glass-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); filter: brightness(1); }
  50% { opacity: 0.9; transform: scale(1.08); filter: brightness(1.2); }
}
@keyframes glass-breathe {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes reflection-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes light-sweep {
  0% { opacity: 0; transform: translateX(-100%) skewX(-15deg); }
  30% { opacity: 0.7; }
  70% { opacity: 0.7; }
  100% { opacity: 0; transform: translateX(200%) skewX(-15deg); }
}
@keyframes particle-dance {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
  20% { transform: translateY(-40px) translateX(15px) scale(1.2); opacity: 0.8; }
  40% { transform: translateY(-60px) translateX(-10px) scale(0.9); opacity: 0.6; }
  60% { transform: translateY(-35px) translateX(20px) scale(1.1); opacity: 0.7; }
  80% { transform: translateY(-15px) translateX(-5px) scale(1); opacity: 0.5; }
}
@keyframes screen-glow-premium {
  0%, 100% {
    box-shadow:
      0 0 40px rgba(59, 130, 246, 0.25),
      0 0 80px rgba(59, 130, 246, 0.15),
      inset 0 0 40px rgba(59, 130, 246, 0.08);
  }
  50% {
    box-shadow:
      0 0 60px rgba(59, 130, 246, 0.35),
      0 0 120px rgba(59, 130, 246, 0.2),
      inset 0 0 60px rgba(59, 130, 246, 0.12);
  }
}
@keyframes data-cascade {
  0% { transform: translateY(120%); opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { transform: translateY(-120%); opacity: 0; }
}
@keyframes orbit-elegant {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes dot-glow {
  0%, 100% { transform: scale(1); opacity: 0.6; box-shadow: 0 0 10px currentColor; }
  50% { transform: scale(1.8); opacity: 1; box-shadow: 0 0 25px currentColor, 0 0 50px currentColor; }
}
@keyframes circle-expand {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.3); opacity: 0.6; }
}
@keyframes line-draw {
  0% { stroke-dashoffset: 1000; opacity: 0; }
  50% { opacity: 0.8; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
@keyframes aurora-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes glass-refract {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(15deg) brightness(1.1); }
}
`;

/* ---------- Premium Particle Canvas with Many Lines & Circles ---------- */
function PremiumParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    radius: number; color: string; alpha: number; pulse: number;
  }>>([]);
  const circlesRef = useRef<Array<{
    x: number; y: number; radius: number; maxRadius: number;
    color: string; speed: number; phase: number;
  }>>([]);
  const timeRef = useRef(0);

  const initParticles = useCallback((width: number, height: number) => {
    // Limited color palette - only 3 colors for cleaner look
    const colors = [
      "59, 130, 246",   // Blue (primary)
      "139, 92, 246",   // Purple (accent)
      "99, 102, 241",   // Indigo (secondary)
    ];

    // 50 particles - balanced density
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 1.5 + Math.random() * 2.5, // Smaller particles
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.4 + Math.random() * 0.4,
      pulse: Math.random() * Math.PI * 2,
    }));

    // 15 expanding circles - half the size
    circlesRef.current = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 10 + Math.random() * 25,      // Half the original size
      maxRadius: 35 + Math.random() * 50,   // Half the original max
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0.0015 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    timeRef.current += 0.016;
    const t = timeRef.current;

    // Draw expanding circles with glass effect
    for (const circle of circlesRef.current) {
      const phase = (t * circle.speed + circle.phase) % 1;
      const currentRadius = circle.radius + (circle.maxRadius - circle.radius) * phase;
      const alpha = 0.15 * (1 - phase);

      // Outer glow
      const gradient = ctx.createRadialGradient(
        circle.x, circle.y, currentRadius * 0.5,
        circle.x, circle.y, currentRadius
      );
      gradient.addColorStop(0, `rgba(${circle.color}, 0)`);
      gradient.addColorStop(0.7, `rgba(${circle.color}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${circle.color}, 0)`);

      ctx.beginPath();
      ctx.arc(circle.x, circle.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner ring (glass edge effect)
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, currentRadius * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${circle.color}, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Update and draw particles
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.05;

      // Wrap around edges
      if (p.x < 0) p.x = cw;
      if (p.x > cw) p.x = 0;
      if (p.y < 0) p.y = ch;
      if (p.y > ch) p.y = 0;

      const pulseScale = 1 + Math.sin(p.pulse) * 0.3;
      const currentRadius = p.radius * pulseScale;
      const currentAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);

      // Particle glow
      const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, currentRadius * 3
      );
      gradient.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
      gradient.addColorStop(0.4, `rgba(${p.color}, ${currentAlpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${currentAlpha * 1.5})`;
      ctx.fill();
    }

    // Draw connecting lines between nearby particles - brighter and clearer
    ctx.lineCap = "round";
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p1 = particlesRef.current[i];
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p2 = particlesRef.current[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const alpha = 0.5 * (1 - dist / 150); // Increased from 0.25 to 0.5

          // Create brighter gradient line
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, `rgba(${p1.color}, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.7})`); // Brighter center
          gradient.addColorStop(1, `rgba(${p2.color}, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.2 + (1 - dist / 150) * 1; // Slightly thicker lines
          ctx.stroke();
        }
      }
    }

    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      initParticles(width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw, initParticles]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

/* ---------- Premium Glass Panel ---------- */
function PremiumGlassPanel({
  className = "",
  style,
  children,
  variant = "default",
  glowColor = "blue",
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  variant?: "default" | "screen" | "floating" | "frosted";
  glowColor?: "blue" | "purple" | "green" | "orange" | "pink";
}) {
  const glowColors = {
    blue: "59, 130, 246",
    purple: "139, 92, 246",
    green: "34, 197, 94",
    orange: "251, 146, 60",
    pink: "236, 72, 153",
  };

  const baseStyles = {
    default: "bg-white/70 backdrop-blur-2xl border border-white/50",
    screen: "bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl border border-white/20",
    floating: "bg-white/50 backdrop-blur-xl border border-white/40",
    frosted: "bg-gradient-to-br from-white/60 via-white/40 to-white/60 backdrop-blur-2xl border border-white/60",
  };

  const rgb = glowColors[glowColor];

  return (
    <div
      className={`relative rounded-2xl shadow-2xl overflow-hidden ${baseStyles[variant]} ${className}`}
      style={{
        boxShadow: `
          0 8px 32px rgba(${rgb}, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset,
          0 32px 64px -12px rgba(0, 0, 0, 0.1)
        `,
        ...style,
      }}
    >
      {/* Multi-layer glass reflection */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {/* Primary reflection gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              135deg,
              rgba(255,255,255,0.4) 0%,
              rgba(255,255,255,0.1) 25%,
              transparent 50%,
              rgba(${rgb},0.05) 75%,
              rgba(255,255,255,0.1) 100%
            )`,
          }}
        />
        {/* Secondary reflection */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              -45deg,
              transparent 0%,
              rgba(255,255,255,0.15) 50%,
              transparent 100%
            )`,
            opacity: 0.5,
          }}
        />
        {/* Shimmer sweep effect */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,0.6) 45%,
              rgba(255,255,255,0.8) 50%,
              rgba(255,255,255,0.6) 55%,
              transparent 100%
            )`,
            animation: "shimmer-flow 6s ease-in-out infinite",
          }}
        />
        {/* Edge highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)`,
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ---------- Premium Laptop Screen ---------- */
function PremiumLaptopScreen({
  side,
  size = "large",
  glowColor = "blue"
}: {
  side: "left" | "right";
  size?: "large" | "medium" | "small";
  glowColor?: "blue" | "purple" | "green";
}) {
  const isLeft = side === "left";
  const sizeConfig = {
    large: { width: 200, height: 135, codeLines: 10 },
    medium: { width: 160, height: 108, codeLines: 7 },
    small: { width: 120, height: 80, codeLines: 5 },
  };
  const config = sizeConfig[size];

  const glowColors: Record<string, string> = {
    blue: "59, 130, 246",
    purple: "139, 92, 246",
    green: "34, 197, 94",
  };

  const rgb = glowColors[glowColor];

  return (
    <div
      className={`absolute ${isLeft ? "left-[3%] top-[12%]" : "right-[3%] bottom-[8%]"}`}
      style={{
        perspective: 1200,
        zIndex: 5,
        animation: `glass-float${isLeft ? "" : "-reverse"} 12s ease-in-out infinite`,
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${isLeft ? "-18" : "18"}deg) rotateX(8deg)`,
        }}
      >
        <PremiumGlassPanel
          variant="screen"
          glowColor={glowColor as "blue" | "purple" | "green"}
          style={{
            width: config.width,
            height: config.height,
            animation: "screen-glow-premium 5s ease-in-out infinite",
          }}
        >
          <div className="h-full overflow-hidden p-4">
            {/* macOS style top bar */}
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <div className="ml-4 h-1.5 flex-1 rounded-full bg-white/10" />
            </div>

            {/* Code lines with varied colors */}
            <div className="space-y-2">
              {Array.from({ length: config.codeLines }).map((_, i) => {
                const colors = [
                  `rgba(${rgb}, 0.7)`,
                  "rgba(74, 222, 128, 0.6)",
                  "rgba(251, 191, 36, 0.6)",
                  "rgba(248, 113, 113, 0.5)",
                  "rgba(167, 139, 250, 0.6)",
                ];
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[8px] text-white/30 w-4">{i + 1}</span>
                    <div
                      className="h-2 rounded-sm"
                      style={{
                        width: `${15 + ((i * 41) % 60)}%`,
                        backgroundColor: colors[i % colors.length],
                        animation: `glass-pulse ${2.5 + (i % 4) * 0.5}s ease-in-out infinite ${i * 0.2}s`,
                        boxShadow: `0 0 10px ${colors[i % colors.length]}`,
                      }}
                    />
                    {i % 3 === 0 && (
                      <div
                        className="h-2 rounded-sm"
                        style={{
                          width: `${10 + ((i * 29) % 25)}%`,
                          backgroundColor: colors[(i + 2) % colors.length],
                          animation: `glass-pulse ${3 + (i % 3) * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Blinking cursor */}
            <div className="mt-3 flex items-center gap-1">
              <span className="text-[8px] text-white/30 w-4">{config.codeLines + 1}</span>
              <div
                className="h-3 w-0.5 rounded-full"
                style={{
                  backgroundColor: `rgba(${rgb}, 0.9)`,
                  animation: "glass-breathe 1s step-end infinite",
                  boxShadow: `0 0 8px rgba(${rgb}, 0.6)`,
                }}
              />
            </div>
          </div>

          {/* Screen glare overlay */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(
                120deg,
                rgba(255,255,255,0.1) 0%,
                transparent 30%,
                transparent 70%,
                rgba(255,255,255,0.05) 100%
              )`,
            }}
          />
        </PremiumGlassPanel>

        {/* Laptop base with reflection */}
        <div
          className="mx-auto rounded-b-xl overflow-hidden"
          style={{
            width: config.width * 1.15,
            height: 10,
            background: "linear-gradient(to bottom, #d1d5db, #9ca3af)",
            transform: "rotateX(70deg) translateY(-5px)",
            transformOrigin: "top center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4) 50%, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Floating Glass Card ---------- */
function FloatingGlassCard({
  x,
  y,
  delay = 0,
  glowColor = "blue",
  size = "medium"
}: {
  x: string;
  y: string;
  delay?: number;
  glowColor?: "blue" | "purple" | "green" | "orange" | "pink";
  size?: "small" | "medium" | "large";
}) {
  const sizeConfig = {
    small: { w: 100, h: 65 },
    medium: { w: 130, h: 85 },
    large: { w: 160, h: 105 },
  };
  const config = sizeConfig[size];

  const glowColors: Record<string, string> = {
    blue: "59, 130, 246",
    purple: "139, 92, 246",
    green: "34, 197, 94",
    orange: "251, 146, 60",
    pink: "236, 72, 153",
  };

  return (
    <div
      className="absolute hidden md:block"
      style={{
        left: x,
        top: y,
        animation: `glass-float-alt 10s ease-in-out infinite ${delay}s`,
        zIndex: 4,
      }}
    >
      <PremiumGlassPanel
        variant="frosted"
        glowColor={glowColor}
        className="p-4"
        style={{ width: config.w, height: config.h }}
      >
        <div className="space-y-2.5">
          <div
            className="h-2.5 rounded-full"
            style={{
              width: "75%",
              backgroundColor: `rgba(${glowColors[glowColor]}, 0.5)`,
              boxShadow: `0 0 12px rgba(${glowColors[glowColor]}, 0.3)`,
            }}
          />
          <div
            className="h-2 rounded-full bg-slate-400/30"
            style={{ width: "55%" }}
          />
          <div
            className="h-2 rounded-full bg-slate-300/25"
            style={{ width: "65%" }}
          />
          <div className="flex gap-2 pt-1">
            <div className="h-4 w-4 rounded-full bg-green-400/40" />
            <div className="h-4 flex-1 rounded bg-slate-400/20" />
          </div>
        </div>
      </PremiumGlassPanel>
    </div>
  );
}

/* ---------- Premium Orbital Ring ---------- */
function PremiumOrbitalRing({
  size,
  duration,
  reverse = false,
  color = "blue",
  dotCount = 3,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  color?: "blue" | "purple" | "green" | "orange";
  dotCount?: number;
}) {
  const colors: Record<string, string> = {
    blue: "59, 130, 246",
    purple: "139, 92, 246",
    green: "34, 197, 94",
    orange: "251, 146, 60",
  };
  const rgb = colors[color];

  return (
    <div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        animation: `orbit-elegant ${duration}s linear infinite ${reverse ? "reverse" : ""}`,
        zIndex: 2,
      }}
    >
      {/* Ring with gradient */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1.5px solid rgba(${rgb}, 0.2)`,
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.03) 0%, transparent 70%)`,
          boxShadow: `
            0 0 20px rgba(${rgb}, 0.1),
            inset 0 0 30px rgba(${rgb}, 0.05)
          `,
        }}
      />
      {/* Orbiting dots */}
      {Array.from({ length: dotCount }).map((_, i) => (
        <div
          key={i}
          className="absolute h-3 w-3 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${(360 / dotCount) * i}deg) translateX(${size / 2}px) translateY(-50%)`,
            backgroundColor: `rgba(${rgb}, 0.8)`,
            boxShadow: `0 0 15px rgba(${rgb}, 0.6), 0 0 30px rgba(${rgb}, 0.3)`,
            animation: `dot-glow ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Data Stream Column ---------- */
function DataStream({ x, delay = 0, color = "blue" }: { x: string; delay?: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: "59, 130, 246",
    purple: "139, 92, 246",
    green: "34, 197, 94",
    orange: "251, 146, 60",
  };
  const rgb = colors[color] || colors.blue;

  return (
    <div className="absolute hidden sm:block" style={{ left: x, top: 0, bottom: 0, zIndex: 2 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute w-1.5 rounded-full"
          style={{
            height: `${15 + i * 5}px`,
            background: `linear-gradient(to bottom, transparent, rgba(${rgb}, 0.6), transparent)`,
            animation: `data-cascade ${5 + i * 0.8}s linear infinite ${delay + i * 0.8}s`,
            boxShadow: `0 0 8px rgba(${rgb}, 0.4)`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Floating Circle ---------- */
function FloatingCircle({
  x,
  y,
  size,
  color,
  delay = 0
}: {
  x: string;
  y: string;
  size: number;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none hidden sm:block"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(${color}, 0.15) 0%, rgba(${color}, 0.05) 50%, transparent 70%)`,
        animation: `circle-expand 8s ease-in-out infinite ${delay}s`,
        boxShadow: `0 0 40px rgba(${color}, 0.1)`,
        zIndex: 1,
      }}
    />
  );
}

/* ========== Main Component ========== */
export default function Hero3DScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      suppressHydrationWarning
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease-in-out" }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Premium gradient background with aurora effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg,
              #f8fafc 0%,
              #e0f2fe 25%,
              #f0fdf4 50%,
              #faf5ff 75%,
              #f8fafc 100%
            )
          `,
          backgroundSize: "400% 400%",
          animation: "aurora-shift 20s ease infinite",
        }}
      />

      {/* Enhanced grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.04) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1.5px, transparent 1.5px),
            linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px, 80px 80px, 20px 20px, 20px 20px",
        }}
      />

      {/* Floating circles for depth - reduced sizes */}
      <FloatingCircle x="5%" y="10%" size={150} color="59, 130, 246" delay={0} />
      <FloatingCircle x="75%" y="8%" size={120} color="139, 92, 246" delay={2} />
      <FloatingCircle x="85%" y="55%" size={170} color="59, 130, 246" delay={4} />
      <FloatingCircle x="12%" y="65%" size={100} color="139, 92, 246" delay={1} />

      {/* Premium particle canvas */}
      {mounted && <PremiumParticleCanvas />}

      {/* Ambient glow spots - reduced sizes and using only blue/purple */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: "-10%",
          top: "15%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          right: "-5%",
          bottom: "10%",
          width: 350,
          height: 350,
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)",
          filter: "blur(45px)",
        }}
      />

      {/* Premium Laptop screens */}
      <div className="hidden lg:block">
        <PremiumLaptopScreen side="left" size="large" glowColor="blue" />
        <PremiumLaptopScreen side="right" size="medium" glowColor="purple" />
      </div>
      <div className="hidden md:block lg:hidden">
        <PremiumLaptopScreen side="left" size="small" glowColor="blue" />
        <PremiumLaptopScreen side="right" size="small" glowColor="green" />
      </div>

      {/* Floating glass cards - only blue/purple */}
      <FloatingGlassCard x="12%" y="55%" delay={0} glowColor="blue" size="medium" />
      <FloatingGlassCard x="78%" y="20%" delay={1.5} glowColor="purple" size="large" />
      <FloatingGlassCard x="82%" y="65%" delay={3} glowColor="blue" size="small" />

      {/* Orbital rings - only 2, blue/purple palette */}
      <PremiumOrbitalRing size={320} duration={50} color="blue" dotCount={3} />
      <PremiumOrbitalRing size={480} duration={70} reverse color="purple" dotCount={2} />

      {/* Data streams - only 3, blue/purple */}
      <DataStream x="15%" delay={0} color="blue" />
      <DataStream x="50%" delay={1.5} color="purple" />
      <DataStream x="85%" delay={2.5} color="blue" />

      {/* Horizontal light beams */}
      <div
        className="absolute hidden sm:block"
        style={{
          top: "25%",
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)",
          animation: "light-sweep 12s ease-in-out infinite",
          zIndex: 3,
        }}
      />
      <div
        className="absolute hidden sm:block"
        style={{
          top: "65%",
          left: 0,
          right: 0,
          height: 1.5,
          background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent)",
          animation: "light-sweep 15s ease-in-out infinite 3s",
          zIndex: 3,
        }}
      />

      {/* Mobile: floating elements - only blue/purple */}
      <div className="sm:hidden">
        {[
          { x: "10%", y: "15%", delay: 0, color: "59, 130, 246" },
          { x: "85%", y: "12%", delay: 1, color: "139, 92, 246" },
          { x: "15%", y: "75%", delay: 2, color: "59, 130, 246" },
          { x: "80%", y: "70%", delay: 3, color: "139, 92, 246" },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute h-3 w-3 rounded-full"
            style={{
              left: dot.x,
              top: dot.y,
              backgroundColor: `rgba(${dot.color}, 0.5)`,
              animation: `particle-dance 8s ease-in-out infinite ${dot.delay}s`,
              boxShadow: `0 0 15px rgba(${dot.color}, 0.4)`,
            }}
          />
        ))}
      </div>

      {/* Premium bottom fade for content readability */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.5) 50%, transparent)",
        }}
      />
    </div>
  );
}
