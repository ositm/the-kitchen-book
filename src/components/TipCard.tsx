"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";

export default function TipCard() {
  const [tip, setTip] = useState({
    category: "Storage Hack",
    title: "Keep your garri crisp, dry and mold-free during humid weather",
    body: "Store garri in an airtight container with a small dry bay leaf on top. Always use dry utensils and never scoop with wet hands."
  });

  useEffect(() => {
    async function loadTip() {
      try {
        const { data } = await supabase.from("tips").select("*").limit(6);
        if (data && data.length > 0) {
          const dayIndex = new Date().getDate() % data.length;
          setTip(data[dayIndex]);
        }
      } catch (err) {
        console.error("Failed to load tip from Supabase", err);
      }
    }
    loadTip();
  }, []);

  return (
    <div className="bg-white border border-[#EAE4D7] rounded-3xl p-5 sm:p-6 shadow-2xs food-card-hover flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Top Header Tag */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-sage-light flex items-center justify-center text-primary">
              <Lightbulb className="w-3 h-3 fill-primary" />
            </span>
            <span>Today's Kitchen Tip</span>
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-border/60">
            {tip.category}
          </span>
        </div>

        {/* Title & Body */}
        <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5 leading-snug">
          {tip.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {tip.body}
        </p>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-3 border-t border-[#F0ECE3] flex items-center justify-between">
        <span className="text-[11px] font-medium text-primary">
          💡 Verified Nigerian Kitchen Secret
        </span>
        <Link
          href="/tips"
          className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors group"
        >
          <span>See all tips</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
