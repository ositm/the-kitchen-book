"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import AiMealSuggesterModal from "./AiMealSuggesterModal";

export default function AiAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-primary via-emerald-700 to-accent text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20"
        aria-label="Ask Chef Oracle AI"
      >
        <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
        <span className="tracking-wide">Ask Chef AI ✨</span>
      </button>

      {/* Interactive AI Modal */}
      <AiMealSuggesterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
