"use client";

import { useEffect, useRef, useState } from "react";

const C = ["#ee5511", "#dd2266", "#3355ee", "#8833cc", "#1ec8c0", "#c8e03a"];

export default function Intro() {
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = () => {
    clearTimeout(timer.current);
    setPhase("out");
    setTimeout(() => setPhase("hidden"), 750);
  };

  const show = () => {
    clearTimeout(timer.current);
    setPhase("in");
    timer.current = setTimeout(dismiss, 4400);
  };

  useEffect(() => {
    if (!sessionStorage.getItem("wc-intro-2026")) {
      sessionStorage.setItem("wc-intro-2026", "1");
      show();
    }
    const h = () => show();
    window.addEventListener("wc:intro", h);
    return () => window.removeEventListener("wc:intro", h);
  }, []);

  if (phase === "hidden") return null;

  return (
    <>
      <style>{`
        @keyframes wc-bg   { from{opacity:0} to{opacity:1} }
        @keyframes wc-ring { 0%{transform:translate(-50%,-50%) scale(.15);opacity:.9} 100%{transform:translate(-50%,-50%) scale(4.5);opacity:0} }
        @keyframes wc-logo { 0%{opacity:0;transform:scale(.35);filter:blur(12px)} 65%{transform:scale(1.07);filter:blur(0);opacity:1} 100%{opacity:1;transform:scale(1);filter:blur(0)} }
        @keyframes wc-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wc-dot  { from{opacity:0;transform:scale(0) rotate(-180deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes wc-arc  { from{stroke-dashoffset:251.2;opacity:0} to{stroke-dashoffset:0;opacity:1} }
        @keyframes wc-bar  { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
        @keyframes wc-pulse{ 0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.06)} }
      `}</style>

      <div
        onClick={dismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer",
          overflow: "hidden",
          opacity: phase === "out" ? 0 : 1,
          transition: "opacity .75s ease",
        }}
      >
        {/* Background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 120% 120% at 50% 60%, #1a0525 0%, #0d0d1a 50%, #000 100%)",
          animation: "wc-bg .5s ease forwards",
        }} />

        {/* Hex pattern overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: .04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }} />

        {/* Expanding rings */}
        {([0, 0.55, 1.1] as number[]).map((delay, i) => (
          <div key={i} style={{
            position: "absolute", left: "50%", top: "50%",
            width: 180, height: 180, borderRadius: "50%",
            border: `1.5px solid ${C[i * 2]}66`,
            animation: `wc-ring 2.6s ease-out ${delay}s infinite`,
          }} />
        ))}

        {/* Pulsing center glow */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(130,134,205,.18) 0%, transparent 70%)",
          animation: "wc-pulse 2s ease infinite",
        }} />

        {/* SVG segmented arc */}
        <svg
          style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%,-50%)",
            width: 260, height: 260,
          }}
          viewBox="0 0 100 100"
        >
          {C.map((color, i) => {
            const r = 44;
            const circ = 2 * Math.PI * r;
            const seg = circ / 6;
            return (
              <circle
                key={color}
                cx="50" cy="50" r={r}
                fill="none" stroke={color} strokeWidth="5"
                strokeDasharray={`${seg - 5} 5`}
                strokeDashoffset={-(i * seg)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{
                  animation: `wc-arc .9s cubic-bezier(.4,0,.2,1) ${.5 + i * .08}s both`,
                  filter: `drop-shadow(0 0 5px ${color})`,
                }}
              />
            );
          })}
        </svg>

        {/* Center: "FIFA WORLD CUP" + "2026" */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", userSelect: "none",
          animation: "wc-logo 1.3s cubic-bezier(.4,0,.2,1) .35s both",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.38em", color: "rgba(255,255,255,.42)",
            fontFamily: "system-ui,sans-serif", fontWeight: 600,
            textTransform: "uppercase", marginBottom: 4,
          }}>
            FIFA WORLD CUP
          </div>
          <div style={{
            fontSize: 70, fontWeight: 900, lineHeight: 1,
            letterSpacing: "-.03em", fontFamily: "system-ui,sans-serif",
            background: "linear-gradient(135deg,#ee5511 0%,#dd2266 25%,#fff 50%,#1ec8c0 75%,#c8e03a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            2026
          </div>
          <div style={{
            fontSize: 9, letterSpacing: "0.28em", color: "rgba(255,255,255,.28)",
            fontFamily: "system-ui,sans-serif", marginTop: 6,
            textTransform: "uppercase",
            animation: "wc-up .7s ease 1.5s both", opacity: 0,
          }}>
            Mexico · USA · Canada
          </div>
        </div>

        {/* Colored dots */}
        <div style={{
          position: "absolute", left: "50%", bottom: "28%",
          transform: "translateX(-50%)", display: "flex", gap: 10,
        }}>
          {C.map((color, i) => (
            <div key={color} style={{
              width: 9, height: 9, borderRadius: "50%",
              background: color, boxShadow: `0 0 10px ${color}`,
              animation: `wc-dot .4s cubic-bezier(.4,0,.2,1) ${1.9 + i * .07}s both`,
              opacity: 0,
            }} />
          ))}
        </div>

        {/* Bottom stripe bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 5,
          background: `linear-gradient(90deg,${C.join(",")})`,
          animation: "wc-bar 1s cubic-bezier(.4,0,.2,1) .8s both",
          opacity: .9,
        }} />

        {/* Skip hint */}
        <div style={{
          position: "absolute", bottom: 14, left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,.2)", fontSize: 10,
          letterSpacing: "0.14em", fontFamily: "system-ui,sans-serif",
          animation: "wc-up .7s ease 2.2s both", opacity: 0,
        }}>
          點擊跳過
        </div>
      </div>
    </>
  );
}
