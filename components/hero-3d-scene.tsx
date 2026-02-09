"use client";

import { useEffect, useState } from "react";

const STATIC_NODES = [
  { left: "5%", top: "12%", size: 3, floatDur: 8, floatDelay: 0.2, glowDur: 3, glowDelay: 0.1 },
  { left: "15%", top: "65%", size: 2, floatDur: 10, floatDelay: 1.4, glowDur: 3.5, glowDelay: 0.7 },
  { left: "25%", top: "30%", size: 4, floatDur: 9, floatDelay: 0.8, glowDur: 4, glowDelay: 0.4 },
  { left: "35%", top: "80%", size: 2, floatDur: 11, floatDelay: 2.1, glowDur: 3.2, glowDelay: 1.0 },
  { left: "45%", top: "15%", size: 3, floatDur: 7, floatDelay: 0.5, glowDur: 2.8, glowDelay: 0.3 },
  { left: "55%", top: "50%", size: 3, floatDur: 12, floatDelay: 3.0, glowDur: 4.5, glowDelay: 1.5 },
  { left: "65%", top: "72%", size: 4, floatDur: 8, floatDelay: 1.8, glowDur: 3, glowDelay: 0.9 },
  { left: "72%", top: "22%", size: 2, floatDur: 10, floatDelay: 2.5, glowDur: 3.8, glowDelay: 1.2 },
  { left: "82%", top: "55%", size: 3, floatDur: 9, floatDelay: 0.3, glowDur: 2.5, glowDelay: 0.2 },
  { left: "90%", top: "38%", size: 4, floatDur: 11, floatDelay: 1.0, glowDur: 4.2, glowDelay: 0.5 },
  { left: "10%", top: "45%", size: 2, floatDur: 13, floatDelay: 3.5, glowDur: 5, glowDelay: 1.8 },
  { left: "30%", top: "55%", size: 3, floatDur: 7, floatDelay: 0.7, glowDur: 2.8, glowDelay: 0.4 },
  { left: "50%", top: "88%", size: 3, floatDur: 10, floatDelay: 2.2, glowDur: 3.6, glowDelay: 1.1 },
  { left: "60%", top: "8%", size: 2, floatDur: 9, floatDelay: 1.6, glowDur: 4.0, glowDelay: 0.8 },
  { left: "78%", top: "78%", size: 4, floatDur: 8, floatDelay: 0.9, glowDur: 3.4, glowDelay: 0.5 },
  { left: "88%", top: "15%", size: 3, floatDur: 12, floatDelay: 2.8, glowDur: 4.5, glowDelay: 1.4 },
  { left: "18%", top: "90%", size: 2, floatDur: 11, floatDelay: 3.2, glowDur: 3.8, glowDelay: 1.6 },
  { left: "42%", top: "92%", size: 3, floatDur: 7, floatDelay: 0.4, glowDur: 2.6, glowDelay: 0.2 },
  { left: "68%", top: "90%", size: 3, floatDur: 10, floatDelay: 1.2, glowDur: 3.2, glowDelay: 0.6 },
  { left: "95%", top: "60%", size: 2, floatDur: 9, floatDelay: 2.0, glowDur: 4.0, glowDelay: 1.0 },
];

/* ---- Floating icon: Growth chart (siniq chiziqli graph) ---- */
function GrowthChart() {
  return (
    <div
      className="absolute hidden sm:block"
      style={{
        left: "6%",
        top: "22%",
        animation: "float-slow 10s ease-in-out infinite",
      }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
        <rect width="56" height="56" rx="14" fill="white" fillOpacity="0.9" stroke="#dbeafe" strokeWidth="1" />
        <polyline
          points="12,40 20,32 28,36 36,22 44,14"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate attributeName="stroke-dashoffset" values="80;0" dur="2s" fill="freeze" />
          <animate attributeName="stroke-dasharray" values="80;80" dur="0.01s" fill="freeze" />
        </polyline>
        <circle cx="44" cy="14" r="3" fill="#2563eb">
          <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <polygon points="42,12 48,14 44,18" fill="#2563eb" opacity="0.7" />
      </svg>
    </div>
  );
}

/* ---- Floating icon: Level Up arrow ---- */
function LevelUpIcon() {
  return (
    <div
      className="absolute hidden sm:block"
      style={{
        right: "7%",
        top: "20%",
        animation: "float-medium 8s ease-in-out infinite 0.5s",
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
        <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.9" stroke="#dbeafe" strokeWidth="1" />
        <path
          d="M16 34 L16 20 L24 12 L32 20 L32 34"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M18 20 L24 14 L30 20" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </path>
        <rect x="20" y="26" width="8" height="3" rx="1.5" fill="#93c5fd" opacity="0.5" />
        <rect x="20" y="31" width="8" height="3" rx="1.5" fill="#bfdbfe" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ---- Floating icon: Checkmark Badge ---- */
function CheckBadge() {
  return (
    <div
      className="absolute hidden sm:block"
      style={{
        left: "12%",
        bottom: "25%",
        animation: "float-medium 9s ease-in-out infinite 1.2s",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="drop-shadow-lg">
        <rect width="44" height="44" rx="22" fill="white" fillOpacity="0.9" stroke="#dbeafe" strokeWidth="1" />
        <circle cx="22" cy="22" r="12" fill="#2563eb" opacity="0.12">
          <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite" />
        </circle>
        <path d="M15 22 L20 27 L30 17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}

/* ---- Floating icon: AI Chip ---- */
function AIChip() {
  return (
    <div
      className="absolute hidden sm:block"
      style={{
        right: "10%",
        bottom: "28%",
        animation: "float-slow 11s ease-in-out infinite 0.8s",
      }}
    >
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" className="drop-shadow-lg">
        <rect width="50" height="50" rx="12" fill="white" fillOpacity="0.9" stroke="#dbeafe" strokeWidth="1" />
        <rect x="15" y="15" width="20" height="20" rx="4" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
        <text x="25" y="29" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563eb">AI</text>
        {/* Pin lines */}
        <line x1="20" y1="15" x2="20" y2="10" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="15" x2="25" y2="10" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="15" x2="30" y2="10" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="35" x2="20" y2="40" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="35" x2="25" y2="40" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="35" x2="30" y2="40" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="20" x2="10" y2="20" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="25" x2="10" y2="25" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="30" x2="10" y2="30" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="35" y1="20" x2="40" y2="20" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="35" y1="25" x2="40" y2="25" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="35" y1="30" x2="40" y2="30" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="25" cy="25" r="16" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2" fill="none">
          <animateTransform attributeName="transform" type="rotate" values="0 25 25;360 25 25" dur="12s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/* ---- Floating icon: Graduation star ---- */
function GradStar() {
  return (
    <div
      className="absolute hidden sm:block"
      style={{
        left: "28%",
        top: "12%",
        animation: "float-medium 7s ease-in-out infinite 2s",
      }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="drop-shadow-md">
        <polygon
          points="18,4 21,14 32,14 23,20 26,30 18,24 10,30 13,20 4,14 15,14"
          fill="#2563eb"
          opacity="0.15"
          stroke="#3b82f6"
          strokeWidth="1"
        >
          <animate attributeName="opacity" values="0.15;0.3;0.15" dur="3s" repeatCount="indefinite" />
        </polygon>
      </svg>
    </div>
  );
}

/* ---- Floating icon: Target / bullseye ---- */
function TargetIcon() {
  return (
    <div
      className="absolute hidden sm:block"
      style={{
        right: "25%",
        top: "10%",
        animation: "float-slow 12s ease-in-out infinite 1.5s",
      }}
    >
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="drop-shadow-md">
        <circle cx="17" cy="17" r="14" stroke="#3b82f6" strokeWidth="1.5" opacity="0.2" fill="none" />
        <circle cx="17" cy="17" r="9" stroke="#3b82f6" strokeWidth="1.5" opacity="0.3" fill="none" />
        <circle cx="17" cy="17" r="4" fill="#2563eb" opacity="0.5">
          <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/* ---- Small floating dots for mobile ---- */
function MobileDots() {
  return (
    <>
      <div
        className="absolute sm:hidden"
        style={{ left: "8%", top: "15%", animation: "float-slow 8s ease-in-out infinite" }}
      >
        <div className="h-2 w-2 rounded-full bg-blue-400/40" />
      </div>
      <div
        className="absolute sm:hidden"
        style={{ right: "8%", top: "12%", animation: "float-medium 7s ease-in-out infinite 0.5s" }}
      >
        <div className="h-2.5 w-2.5 rounded-full bg-blue-500/30" />
      </div>
      <div
        className="absolute sm:hidden"
        style={{ left: "15%", bottom: "30%", animation: "float-medium 9s ease-in-out infinite 1s" }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-blue-400/50" />
      </div>
      <div
        className="absolute sm:hidden"
        style={{ right: "12%", bottom: "25%", animation: "float-slow 10s ease-in-out infinite 2s" }}
      >
        <div className="h-2 w-2 rounded-full bg-blue-500/30" />
      </div>
    </>
  );
}

/* ---- Dashed connection lines ---- */
function ConnectionLines() {
  return (
    <svg className="absolute inset-0 hidden h-full w-full sm:block" style={{ zIndex: 1 }}>
      <line x1="18%" y1="35%" x2="40%" y2="20%" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.12">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="60%" y1="18%" x2="82%" y2="32%" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.12">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" />
      </line>
      <line x1="20%" y1="68%" x2="42%" y2="85%" stroke="#60a5fa" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.1">
        <animate attributeName="stroke-dashoffset" values="0;-16" dur="3s" repeatCount="indefinite" />
      </line>
      <line x1="60%" y1="80%" x2="82%" y2="65%" stroke="#60a5fa" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.1">
        <animate attributeName="stroke-dashoffset" values="0;-16" dur="2.8s" repeatCount="indefinite" />
      </line>
    </svg>
  );
}

export default function Hero3DScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.8s ease-in-out",
      }}
    >
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-node {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.2; }
          50% { transform: translate(4px, -8px); opacity: 0.5; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.6); opacity: 0.15; }
        }
      `}</style>

      {/* Neural particles */}
      {STATIC_NODES.map((node, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400/25"
          style={{
            left: node.left,
            top: node.top,
            width: node.size,
            height: node.size,
            animation: `float-node ${node.floatDur}s ease-in-out infinite`,
            animationDelay: `${node.floatDelay}s`,
          }}
        >
          <div
            className="h-full w-full rounded-full bg-blue-500/50"
            style={{
              animation: `pulse-glow ${node.glowDur}s ease-in-out infinite`,
              animationDelay: `${node.glowDelay}s`,
            }}
          />
        </div>
      ))}

      <ConnectionLines />

      {/* Desktop floating icons */}
      <GrowthChart />
      <LevelUpIcon />
      <CheckBadge />
      <AIChip />
      <GradStar />
      <TargetIcon />

      {/* Mobile only dots */}
      <MobileDots />

      {/* Ambient glow */}
      <div className="absolute left-[8%] top-[20%] h-32 w-32 rounded-full bg-blue-500/[0.07] blur-3xl sm:h-40 sm:w-40" />
      <div className="absolute right-[8%] top-[15%] h-28 w-28 rounded-full bg-blue-400/[0.06] blur-3xl sm:h-36 sm:w-36" />
      <div className="absolute bottom-[20%] left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-3xl sm:h-44 sm:w-44" />
    </div>
  );
}
