"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   AI University Hero - Light Theme (Hydration-safe)
   30 English slogans, click-to-pause, slower speed
   ============================================================ */


const KEYFRAMES = `
@keyframes hero-shape-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-16px) rotate(6deg); }
}
@keyframes hero-shape-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes hero-laptop-float-left {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-12px) translateX(4px); }
  66% { transform: translateY(6px) translateX(-3px); }
}
@keyframes hero-laptop-float-right {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(8px) translateX(-5px); }
  66% { transform: translateY(-10px) translateX(3px); }
}
@keyframes hero-laptop-rotate {
  0%, 100% { transform: rotateY(-12deg) rotateX(5deg); }
  50% { transform: rotateY(12deg) rotateX(-3deg); }
}
@keyframes hero-pulse-dot {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.8); opacity: 0.9; }
}
@keyframes hero-orbit-ring {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes hero-scan-h {
  0% { left: -10%; opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { left: 110%; opacity: 0; }
}
@keyframes hero-data-rise {
  0% { transform: translateY(0); opacity: 0.4; }
  100% { transform: translateY(-120px); opacity: 0; }
}
`;


/* ---------- Canvas: circuit particles + connections ---------- */
function CircuitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; r: number; o: number }[]
  >([]);
  const initRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles = particlesRef.current;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = cw;
      if (p.x > cw) p.x = 0;
      if (p.y < 0) p.y = ch;
      if (p.y > ch) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37, 99, 235, ${Math.min(p.o * 2.5, 0.6)})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < 22000) {
          const alpha = 0.15 * (1 - dist / 22000);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 0.6;
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
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    if (!initRef.current) {
      initRef.current = true;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.min(50, Math.floor((w * h) / 15000));
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: (i * 37.3 + 13) % w,
          y: (i * 53.7 + 17) % h,
          vx: ((i % 7) - 3) * 0.12,
          vy: ((i % 5) - 2) * 0.1,
          r: 1.8 + (i % 3) * 0.6,
          o: 0.15 + (i % 5) * 0.06,
        });
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

/* ---------- Static wireframe shapes ---------- */
const WIREFRAME_SHAPES = [
  { type: "tetra", x: 5, y: 15, size: 72, dur: 18, delay: 0, floatDur: 12 },
  { type: "cube", x: 88, y: 20, size: 62, dur: 22, delay: 2, floatDur: 10 },
  { type: "octa", x: 12, y: 70, size: 56, dur: 15, delay: 1, floatDur: 14 },
  { type: "tetra", x: 92, y: 65, size: 65, dur: 20, delay: 3, floatDur: 11 },
  { type: "diamond", x: 75, y: 8, size: 50, dur: 16, delay: 0.5, floatDur: 13 },
  { type: "cube", x: 25, y: 85, size: 52, dur: 24, delay: 4, floatDur: 15 },
];

function WireframeShape({ type, size }: { type: string; size: number }) {
  const s = size;
  const half = s / 2;
  if (type === "tetra") {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <polygon points={`${half},${s * 0.1} ${s * 0.15},${s * 0.85} ${s * 0.85},${s * 0.85}`} stroke="rgba(37,99,235,0.4)" strokeWidth="1.2" fill="rgba(37,99,235,0.06)" />
        <line x1={half} y1={s * 0.1} x2={half} y2={s * 0.55} stroke="rgba(37,99,235,0.25)" strokeWidth="0.8" />
        <line x1={s * 0.15} y1={s * 0.85} x2={half} y2={s * 0.55} stroke="rgba(37,99,235,0.25)" strokeWidth="0.8" />
        <line x1={s * 0.85} y1={s * 0.85} x2={half} y2={s * 0.55} stroke="rgba(37,99,235,0.25)" strokeWidth="0.8" />
      </svg>
    );
  }
  if (type === "cube") {
    const o = s * 0.2;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <rect x={o} y={o} width={s - 2 * o} height={s - 2 * o} stroke="rgba(37,99,235,0.35)" strokeWidth="1.2" fill="rgba(37,99,235,0.05)" />
        <rect x={o + 8} y={o - 8} width={s - 2 * o} height={s - 2 * o} stroke="rgba(37,99,235,0.2)" strokeWidth="0.8" fill="none" />
        <line x1={o} y1={o} x2={o + 8} y2={o - 8} stroke="rgba(37,99,235,0.2)" strokeWidth="0.8" />
        <line x1={s - o} y1={o} x2={s - o + 8} y2={o - 8} stroke="rgba(37,99,235,0.2)" strokeWidth="0.8" />
        <line x1={s - o} y1={s - o} x2={s - o + 8} y2={s - o - 8} stroke="rgba(37,99,235,0.2)" strokeWidth="0.8" />
        <line x1={o} y1={s - o} x2={o + 8} y2={s - o - 8} stroke="rgba(37,99,235,0.2)" strokeWidth="0.8" />
      </svg>
    );
  }
  if (type === "octa") {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <polygon points={`${half},${s * 0.05} ${s * 0.95},${half} ${half},${s * 0.95} ${s * 0.05},${half}`} stroke="rgba(34,197,94,0.4)" strokeWidth="1.2" fill="rgba(34,197,94,0.06)" />
        <line x1={half} y1={s * 0.05} x2={half} y2={s * 0.95} stroke="rgba(34,197,94,0.22)" strokeWidth="0.8" />
        <line x1={s * 0.05} y1={half} x2={s * 0.95} y2={half} stroke="rgba(34,197,94,0.22)" strokeWidth="0.8" />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <polygon points={`${half},${s * 0.05} ${s * 0.85},${s * 0.35} ${half},${s * 0.95} ${s * 0.15},${s * 0.35}`} stroke="rgba(37,99,235,0.35)" strokeWidth="1.2" fill="rgba(37,99,235,0.05)" />
      <line x1={half} y1={s * 0.05} x2={half} y2={s * 0.95} stroke="rgba(37,99,235,0.18)" strokeWidth="0.8" />
    </svg>
  );
}

/* ---------- CSS 3D Laptop ---------- */
function Laptop3D({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`absolute hidden lg:block ${isLeft ? "left-[3%] top-[30%]" : "right-[3%] bottom-[18%]"}`}
      style={{
        perspective: 600,
        zIndex: 4,
        animation: `hero-laptop-float-${side} 8s ease-in-out infinite`,
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          animation: `hero-laptop-rotate 20s ease-in-out infinite ${isLeft ? "0s" : "5s"}`,
        }}
      >
        {/* Screen */}
        <div
          className="rounded-t-md border border-blue-200/60 bg-gradient-to-b from-slate-50 to-white"
          style={{
            width: 100,
            height: 68,
            transformOrigin: "bottom center",
            transform: "rotateX(-5deg)",
            boxShadow: "0 0 20px rgba(37,99,235,0.08), inset 0 0 0 2px rgba(37,99,235,0.04)",
          }}
        >
          <div className="flex h-full flex-col gap-1 overflow-hidden p-2">
            <div className="h-1 w-[60%] rounded bg-blue-500/40" />
            <div className="h-1 w-[80%] rounded bg-blue-400/30" />
            <div className="h-1 w-[45%] rounded bg-green-500/35" />
            <div className="h-1 w-[70%] rounded bg-blue-500/30" />
            <div className="h-1 w-[55%] rounded bg-blue-400/35" />
            <div className="h-1 w-[65%] rounded bg-green-500/30" />
            <div className="h-1 w-[40%] rounded bg-blue-500/35" />
            <div className="mt-auto flex gap-1">
              <div className="h-1 w-2 rounded bg-blue-600/40" />
              <div className="h-1 w-3 rounded bg-green-600/35" />
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-t-md"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.03) 0%, transparent 50%)" }}
          />
        </div>
        {/* Base */}
        <div
          className="rounded-b-md border border-blue-200/40 bg-gradient-to-b from-slate-100 to-slate-200/80"
          style={{ width: 100, height: 8, transform: "rotateX(70deg)", transformOrigin: "top center" }}
        />
      </div>
    </div>
  );
}

/* ---------- Circuit junction dots (static data) ---------- */
const JUNCTION_DOTS = [
  { cx: 20, cy: 25 }, { cx: 50, cy: 25 }, { cx: 80, cy: 25 },
  { cx: 20, cy: 50 }, { cx: 50, cy: 50 }, { cx: 80, cy: 50 },
  { cx: 20, cy: 75 }, { cx: 50, cy: 75 }, { cx: 80, cy: 75 },
];

/* ---------- Mobile dots (static) ---------- */
const MOBILE_DOTS = [
  { left: "10%", top: "15%", dur: 4, delay: 0, size: "h-2 w-2", color: "bg-blue-400/25" },
  { right: "12%", top: "12%", dur: 5, delay: 1, size: "h-1.5 w-1.5", color: "bg-blue-500/20" },
  { left: "25%", bottom: "20%", dur: 3.5, delay: 0.5, size: "h-1.5 w-1.5", color: "bg-green-400/20" },
  { right: "20%", bottom: "25%", dur: 4.5, delay: 2, size: "h-2 w-2", color: "bg-blue-300/25" },
];

/* ---------- Data rise columns ---------- */
const DATA_RISE_COLS = [15, 35, 65, 85];

/* ========== Main Component ========== */
export default function Hero3DScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease-in-out" }}
    >
      {/* Keyframes injected as plain style (no styled-jsx) */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* White base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Soft glow spots */}
      <div
        className="absolute rounded-full"
        style={{ left: "-5%", top: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)" }}
      />
      <div
        className="absolute rounded-full"
        style={{ right: "-5%", bottom: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)" }}
      />

      {/* Canvas particles (client only) */}
      {mounted && <CircuitCanvas />}

      {/* SVG circuit lines */}
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
        {/* Horizontal */}
        <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="rgba(37,99,235,0.14)" strokeWidth="0.8" strokeDasharray="8 12">
          <animate attributeName="stroke-dashoffset" values="0;-40" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(37,99,235,0.1)" strokeWidth="0.7" strokeDasharray="6 16">
          <animate attributeName="stroke-dashoffset" values="0;-44" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="rgba(37,99,235,0.12)" strokeWidth="0.8" strokeDasharray="10 14">
          <animate attributeName="stroke-dashoffset" values="0;-48" dur="3.5s" repeatCount="indefinite" />
        </line>
        {/* Vertical */}
        <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="rgba(37,99,235,0.1)" strokeWidth="0.7" strokeDasharray="6 18">
          <animate attributeName="stroke-dashoffset" values="0;-48" dur="6s" repeatCount="indefinite" />
        </line>
        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="rgba(37,99,235,0.08)" strokeWidth="0.7" strokeDasharray="8 20">
          <animate attributeName="stroke-dashoffset" values="0;-56" dur="7s" repeatCount="indefinite" />
        </line>
        <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="rgba(37,99,235,0.1)" strokeWidth="0.7" strokeDasharray="5 15">
          <animate attributeName="stroke-dashoffset" values="0;-40" dur="5.5s" repeatCount="indefinite" />
        </line>
        {/* Diagonal */}
        <line x1="5%" y1="10%" x2="35%" y2="45%" stroke="rgba(37,99,235,0.12)" strokeWidth="0.8" strokeDasharray="4 10">
          <animate attributeName="stroke-dashoffset" values="0;-28" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1="95%" y1="15%" x2="65%" y2="50%" stroke="rgba(37,99,235,0.1)" strokeWidth="0.7" strokeDasharray="6 12">
          <animate attributeName="stroke-dashoffset" values="0;-36" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="10%" y1="80%" x2="45%" y2="55%" stroke="rgba(34,197,94,0.12)" strokeWidth="0.8" strokeDasharray="5 14">
          <animate attributeName="stroke-dashoffset" values="0;-38" dur="4.5s" repeatCount="indefinite" />
        </line>
        <line x1="90%" y1="85%" x2="60%" y2="55%" stroke="rgba(34,197,94,0.1)" strokeWidth="0.7" strokeDasharray="4 16">
          <animate attributeName="stroke-dashoffset" values="0;-40" dur="6s" repeatCount="indefinite" />
        </line>
        {/* Junction dots */}
        {JUNCTION_DOTS.map((dot, i) => (
          <circle key={`jd-${i}`} cx={`${dot.cx}%`} cy={`${dot.cy}%`} r="2.5" fill="rgba(37,99,235,0.25)">
            <animate attributeName="r" values="2.5;4.5;2.5" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Floating wireframe shapes */}
      {WIREFRAME_SHAPES.map((shape, i) => (
        <div
          key={`wf-${i}`}
          className="absolute hidden sm:block"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            animation: `hero-shape-float ${shape.floatDur}s ease-in-out infinite ${shape.delay}s`,
            zIndex: 2,
          }}
        >
          <div style={{ animation: `hero-shape-rotate ${shape.dur}s linear infinite` }}>
            <WireframeShape type={shape.type} size={shape.size} />
          </div>
        </div>
      ))}

      {/* Orbital rings (desktop) */}
      <div
        className="absolute hidden sm:block"
        style={{ left: "50%", top: "50%", width: 350, height: 350, animation: "hero-orbit-ring 45s linear infinite", zIndex: 1 }}
      >
        <div className="absolute inset-0 rounded-full border border-blue-400/[0.2]" />
        <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-500/50" style={{ animation: "hero-pulse-dot 2s ease-in-out infinite" }} />
      </div>
      <div
        className="absolute hidden lg:block"
        style={{ left: "50%", top: "50%", width: 550, height: 550, animation: "hero-orbit-ring 70s linear infinite reverse", zIndex: 1 }}
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-blue-300/[0.15]" />
        <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-green-500/45" style={{ animation: "hero-pulse-dot 3s ease-in-out infinite 1s" }} />
      </div>

      {/* 3D CSS Laptops */}
      <Laptop3D side="left" />
      <Laptop3D side="right" />

      {/* Data rising particles (desktop) */}
      {DATA_RISE_COLS.map((x, i) => (
        <div
          key={`dr-${i}`}
          className="absolute hidden sm:block"
          style={{ left: `${x}%`, bottom: "5%", zIndex: 2 }}
        >
          {[0, 1, 2].map((j) => (
            <div
              key={j}
              className="absolute h-1.5 w-1.5 rounded-full bg-blue-500/50"
              style={{ animation: `hero-data-rise ${3 + j}s ease-out infinite ${j * 1.2 + i * 0.5}s` }}
            />
          ))}
        </div>
      ))}

      {/* Horizontal scan line */}
      <div
        className="absolute top-0 hidden h-px sm:block"
        style={{
          width: "20%",
          background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)",
          animation: "hero-scan-h 8s linear infinite",
          zIndex: 3,
        }}
      />

      {/* Mobile: subtle dots */}
      {MOBILE_DOTS.map((dot, i) => (
        <div
          key={`md-${i}`}
          className="absolute sm:hidden"
          style={{
            left: dot.left,
            right: dot.right,
            top: dot.top,
            bottom: dot.bottom,
            animation: `hero-pulse-dot ${dot.dur}s ease-in-out infinite ${dot.delay}s`,
          }}
        >
          <div className={`rounded-full ${dot.size} ${dot.color}`} />
        </div>
      ))}


    </div>
  );
}
