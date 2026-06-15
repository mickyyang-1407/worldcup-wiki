"use client";

export default function IntroTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("wc:intro"))}
      className="text-gray-500 hover:text-gray-300 transition-colors text-xs tracking-widest ml-3"
      title="重播開場動畫"
    >
      ↺ Intro
    </button>
  );
}
