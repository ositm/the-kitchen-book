"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { MOODS } from "@/lib/constants";

interface MoodRailProps {
  selectedMood?: string;
  onSelectMood?: (moodId: string) => void;
}

export default function MoodRail({ selectedMood, onSelectMood }: MoodRailProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            How are you feeling today? 💭
          </h2>
          <p className="text-xs text-muted-foreground">
            Recipes picked for your appetite, time, and budget
          </p>
        </div>
        <Link
          href="/search"
          className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Responsive Horizontal Mood Rail */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <Link
              key={mood.id}
              href={`/search?mood=${mood.id}`}
              onClick={(e) => {
                if (onSelectMood) {
                  e.preventDefault();
                  onSelectMood(mood.id);
                }
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                isSelected
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-card text-foreground/85 border-border hover:border-primary/40 hover:bg-sage-light/50"
              }`}
            >
              <span className="text-base">{mood.icon}</span>
              <span>{mood.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
