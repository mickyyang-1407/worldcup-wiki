"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200" style={{ borderBottomColor: '#8286cd40' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 shrink-0">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: 'linear-gradient(135deg, #8286cd, #26458b)' }}>⚽</span>
            <span className="hidden sm:inline">2026 世界盃</span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
    </nav>
  );
}
