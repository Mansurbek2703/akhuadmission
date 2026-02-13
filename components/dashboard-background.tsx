"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const KEYFRAMES = `
@keyframes dash-shape-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(4deg); }
}
@keyframes dash-shape-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes dash-pulse-dot {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.6); opacity: 1; }
}
@keyframes dash-orbit-ring {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes dash-data-rise {
  0% { transform: translateY(0); opacity: 0.5; }
  100% { transform: translateY(-80px); opacity: 0; }
}
@keyframes dash-scan-h {
  0% { left: -10%; opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { left: 110%; opacity: 0; }
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
      ctx.fillStyle = `rgba(37, 99, 235, ${Math.min(p.o * 3, 0.7)})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < 25000) {
          const alpha = 0.2 * (1 - dist / 25000);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 0.7;
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
      const count = Math.min(40, Math.floor((w * h) / 20000));
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: (i * 37.3 + 13) % w,
          y: (i * 53.7 + 17) % h,
          vx: ((i % 7) - 3) * 0.08,
          vy: ((i % 5) - 2) * 0.07,
          r: 1.5 + (i % 3) * 0.5,
          o: 0.12 + (i % 5) * 0.05,
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

/* ---------- Wireframe shapes ---------- */
const SHAPES = [
  { type: "tetra", x: 3, y: 10, size: 60, dur: 20, delay: 0, floatDur: 14 },
  { type: "cube", x: 90, y: 8, size: 50, dur: 25, delay: 2, floatDur: 12 },
  { type: "octa", x: 8, y: 75, size: 45, dur: 18, delay: 1, floatDur: 16 },
  { type: "diamond", x: 92, y: 70, size: 55, dur: 22, delay: 3, floatDur: 13 },
  { type: "cube", x: 50, y: 90, size: 40, dur: 28, delay: 4, floatDur: 15 },
];

function WireframeShape({ type, size }: { type: string; size: number }) {
  const s = size;
  const half = s / 2;
  if (type === "tetra") {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <polygon points={`${half},${s * 0.1} ${s * 0.15},${s * 0.85} ${s * 0.85},${s * 0.85}`} stroke="rgba(37,99,235,0.5)" strokeWidth="1.4" fill="rgba(37,99,235,0.08)" />
        <line x1={half} y1={s * 0.1} x2={half} y2={s * 0.55} stroke="rgba(37,99,235,0.3)" strokeWidth="0.9" />
        <line x1={s * 0.15} y1={s * 0.85} x2={half} y2={s * 0.55} stroke="rgba(37,99,235,0.3)" strokeWidth="0.9" />
        <line x1={s * 0.85} y1={s * 0.85} x2={half} y2={s * 0.55} stroke="rgba(37,99,235,0.3)" strokeWidth="0.9" />
      </svg>
    );
  }
  if (type === "cube") {
    const o = s * 0.2;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <rect x={o} y={o} width={s - 2 * o} height={s - 2 * o} stroke="rgba(37,99,235,0.45)" strokeWidth="1.4" fill="rgba(37,99,235,0.06)" />
        <rect x={o + 8} y={o - 8} width={s - 2 * o} height={s - 2 * o} stroke="rgba(37,99,235,0.25)" strokeWidth="0.9" fill="none" />
        <line x1={o} y1={o} x2={o + 8} y2={o - 8} stroke="rgba(37,99,235,0.25)" strokeWidth="0.9" />
        <line x1={s - o} y1={o} x2={s - o + 8} y2={o - 8} stroke="rgba(37,99,235,0.25)" strokeWidth="0.9" />
        <line x1={s - o} y1={s - o} x2={s - o + 8} y2={s - o - 8} stroke="rgba(37,99,235,0.25)" strokeWidth="0.9" />
        <line x1={o} y1={s - o} x2={o + 8} y2={s - o - 8} stroke="rgba(37,99,235,0.25)" strokeWidth="0.9" />
      </svg>
    );
  }
  if (type === "octa") {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <polygon points={`${half},${s * 0.05} ${s * 0.95},${half} ${half},${s * 0.95} ${s * 0.05},${half}`} stroke="rgba(34,197,94,0.5)" strokeWidth="1.4" fill="rgba(34,197,94,0.08)" />
        <line x1={half} y1={s * 0.05} x2={half} y2={s * 0.95} stroke="rgba(34,197,94,0.28)" strokeWidth="0.9" />
        <line x1={s * 0.05} y1={half} x2={s * 0.95} y2={half} stroke="rgba(34,197,94,0.28)" strokeWidth="0.9" />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <polygon points={`${half},${s * 0.05} ${s * 0.85},${s * 0.35} ${half},${s * 0.95} ${s * 0.15},${s * 0.35}`} stroke="rgba(37,99,235,0.45)" strokeWidth="1.4" fill="rgba(37,99,235,0.07)" />
      <line x1={half} y1={s * 0.05} x2={half} y2={s * 0.95} stroke="rgba(37,99,235,0.22)" strokeWidth="0.9" />
    </svg>
  );
}

/* ---------- Junction dots ---------- */
const JUNCTION_DOTS = [
  { cx: 15, cy: 20 }, { cx: 50, cy: 20 }, { cx: 85, cy: 20 },
  { cx: 15, cy: 50 }, { cx: 50, cy: 50 }, { cx: 85, cy: 50 },
  { cx: 15, cy: 80 }, { cx: 50, cy: 80 }, { cx: 85, cy: 80 },
];

/* ========== Main Component ========== */
export default function DashboardBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 1.2s ease-in-out" }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/30" />

      {/* Dot grid pattern - more visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.08) 1.2px, transparent 1.2px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Glow spots - stronger */}
      <div
        className="absolute rounded-full"
        style={{ left: "-8%", top: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)" }}
      />
      <div
        className="absolute rounded-full"
        style={{ right: "-5%", bottom: "0%", width: 500, height: 500, background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 65%)" }}
      />
      <div
        className="absolute rounded-full"
        style={{ left: "40%", top: "30%", width: 400, height: 400, background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)" }}
      />

      {/* Canvas particles */}
      {mounted && <CircuitCanvas />}

      {/* SVG circuit lines - higher contrast */}
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
        <line x1="0%" y1="20%" x2="100%" y2="20%" stroke="rgba(37,99,235,0.18)" strokeWidth="0.9" strokeDasharray="8 14">
          <animate attributeName="stroke-dashoffset" values="0;-44" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(37,99,235,0.14)" strokeWidth="0.8" strokeDasharray="6 18">
          <animate attributeName="stroke-dashoffset" values="0;-48" dur="6s" repeatCount="indefinite" />
        </line>
        <line x1="0%" y1="80%" x2="100%" y2="80%" stroke="rgba(37,99,235,0.16)" strokeWidth="0.9" strokeDasharray="10 16">
          <animate attributeName="stroke-dashoffset" values="0;-52" dur="4.5s" repeatCount="indefinite" />
        </line>
        <line x1="15%" y1="0%" x2="15%" y2="100%" stroke="rgba(37,99,235,0.12)" strokeWidth="0.8" strokeDasharray="6 20">
          <animate attributeName="stroke-dashoffset" values="0;-52" dur="7s" repeatCount="indefinite" />
        </line>
        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="rgba(37,99,235,0.1)" strokeWidth="0.7" strokeDasharray="8 22">
          <animate attributeName="stroke-dashoffset" values="0;-60" dur="8s" repeatCount="indefinite" />
        </line>
        <line x1="85%" y1="0%" x2="85%" y2="100%" stroke="rgba(37,99,235,0.12)" strokeWidth="0.8" strokeDasharray="5 18">
          <animate attributeName="stroke-dashoffset" values="0;-46" dur="6.5s" repeatCount="indefinite" />
        </line>
        {/* Diagonals */}
        <line x1="5%" y1="8%" x2="30%" y2="40%" stroke="rgba(37,99,235,0.15)" strokeWidth="0.9" strokeDasharray="4 12">
          <animate attributeName="stroke-dashoffset" values="0;-32" dur="4.5s" repeatCount="indefinite" />
        </line>
        <line x1="95%" y1="12%" x2="70%" y2="45%" stroke="rgba(37,99,235,0.13)" strokeWidth="0.8" strokeDasharray="6 14">
          <animate attributeName="stroke-dashoffset" values="0;-40" dur="5.5s" repeatCount="indefinite" />
        </line>
        <line x1="8%" y1="85%" x2="40%" y2="60%" stroke="rgba(34,197,94,0.15)" strokeWidth="0.9" strokeDasharray="5 16">
          <animate attributeName="stroke-dashoffset" values="0;-42" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="92%" y1="88%" x2="65%" y2="58%" stroke="rgba(34,197,94,0.13)" strokeWidth="0.8" strokeDasharray="4 18">
          <animate attributeName="stroke-dashoffset" values="0;-44" dur="6.5s" repeatCount="indefinite" />
        </line>
        {/* Junction dots - brighter */}
        {JUNCTION_DOTS.map((dot, i) => (
          <circle key={`jd-${i}`} cx={`${dot.cx}%`} cy={`${dot.cy}%`} r="3" fill="rgba(37,99,235,0.35)">
            <animate attributeName="r" values="3;5;3" dur={`${2.5 + (i % 3)}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${2.5 + (i % 3)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Floating wireframe shapes */}
      {SHAPES.map((shape, i) => (
        <div
          key={`wf-${i}`}
          className="absolute hidden sm:block"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            animation: `dash-shape-float ${shape.floatDur}s ease-in-out infinite ${shape.delay}s`,
            zIndex: 2,
          }}
        >
          <div style={{ animation: `dash-shape-rotate ${shape.dur}s linear infinite` }}>
            <WireframeShape type={shape.type} size={shape.size} />
          </div>
        </div>
      ))}

      {/* Orbital ring */}
      <div
        className="absolute hidden sm:block"
        style={{ left: "50%", top: "45%", width: 300, height: 300, animation: "dash-orbit-ring 50s linear infinite", zIndex: 1 }}
      >
        <div className="absolute inset-0 rounded-full border border-blue-400/[0.25]" />
        <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-500/60" style={{ animation: "dash-pulse-dot 2s ease-in-out infinite" }} />
      </div>

      {/* Data rising particles */}
      {[10, 30, 70, 90].map((x, i) => (
        <div
          key={`dr-${i}`}
          className="absolute hidden sm:block"
          style={{ left: `${x}%`, bottom: "3%", zIndex: 2 }}
        >
          {[0, 1, 2].map((j) => (
            <div
              key={j}
              className="absolute h-1.5 w-1.5 rounded-full bg-blue-500/60"
              style={{ animation: `dash-data-rise ${3 + j}s ease-out infinite ${j * 1.2 + i * 0.5}s` }}
            />
          ))}
        </div>
      ))}

      {/* Scan line */}
      <div
        className="absolute top-0 hidden h-px sm:block"
        style={{
          width: "15%",
          background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)",
          animation: "dash-scan-h 10s linear infinite",
          zIndex: 3,
        }}
      />
    </div>
  );
}
