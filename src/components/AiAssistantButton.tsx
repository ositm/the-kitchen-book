"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import AiMealSuggesterModal from "./AiMealSuggesterModal";

export default function AiAssistantButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/") {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (Bottom Right) - Solid Color, No Gradient */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 bg-[var(--pepper)] hover:opacity-90 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-full shadow-lg transition-all flex items-center gap-2 border border-white/20 font-display"
        aria-label="Ask Chef AI"
      >
        <Sparkles className="w-4 h-4 fill-white text-white" />
        <span className="tracking-wide">Ask Chef AI ✨</span>
      </button>

      {/* Interactive AI Modal */}
      <AiMealSuggesterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
