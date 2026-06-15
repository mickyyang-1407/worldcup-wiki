"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/groups", label: "小組" },
  { href: "/schedule", label: "賽程" },
  { href: "/teams", label: "隊伍" },
  { href: "/players", label: "球員" },
  { href: "/countries", label: "國家" },
  { href: "/knockout", label: "淘汰賽" },
  { href: "/venues", label: "場館" },
  { href: "/stats", label: "統計" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10" style={{ borderBottomColor: '#8286cd40' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white shrink-0" onClick={() => setOpen(false)}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: 'linear-gradient(135deg, #8286cd, #26458b)' }}>⚽</span>
              <span className="hidden sm:inline">2026 世界盃</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #8286cd, #26458b)' } : {}}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side: ThemeToggle + Hamburger */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              {/* Hamburger button — mobile only */}
              <button
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                onClick={() => setOpen((v) => !v)}
                aria-label="選單"
              >
                <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${open ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`block w-5 h-0.5 bg-current my-1 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 pt-14" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)}>
          <div
            className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-center py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #8286cd, #26458b)' } : {}}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
