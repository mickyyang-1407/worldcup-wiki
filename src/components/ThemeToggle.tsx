"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const options = [
  { value: "light", icon: "☀️", label: "亮色" },
  { value: "system", icon: "⚙️", label: "自動" },
  { value: "dark",  icon: "🌙", label: "暗色" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-24 h-7" />;

  return (
    <div className="flex items-center rounded-full border border-white/20 bg-black/10 dark:bg-white/10 p-0.5 gap-0.5 shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`flex items-center justify-center w-7 h-6 rounded-full text-sm transition-all ${
            theme === opt.value
              ? "bg-white dark:bg-white/20 shadow-sm"
              : "opacity-50 hover:opacity-80"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
