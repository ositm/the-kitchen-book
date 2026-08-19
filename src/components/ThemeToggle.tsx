"use client";

import { useTheme } from "@/lib/themeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 p-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-warm)] text-[var(--cream)] transition-all active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)] ${className}`}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[var(--palm)] animate-in zoom-in-50 rotate-0 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--cream)] animate-in zoom-in-50 rotate-0 transition-transform duration-300" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-[var(--cream)] select-none">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
