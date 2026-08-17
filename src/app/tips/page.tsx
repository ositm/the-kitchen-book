"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Lightbulb, Zap, ShieldCheck, Sparkles, Search, ChevronRight, Share2, Loader2 } from "lucide-react";

export default function TipsPage() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTips() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tips")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setTips(data);
        }
      } catch (err) {
        console.error("Failed to load tips from Supabase", err);
      } finally {
        setLoading(false);
      }
    }
    loadTips();
  }, []);

  const categories = [
    { id: "all", label: "All Tips" },
    { id: "Preservation", label: "⚡ Power Cuts & Preservation" },
    { id: "Pest Control", label: "🛡️ Pest Control" },
    { id: "Storage", label: "🧺 Storage & Humidity" },
    { id: "Quick Hacks", label: "💡 Quick Hacks" },
  ];

  const filteredTips = tips.filter((tip) => {
    const matchesCat = selectedCategory === "all" || tip.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery =
      !searchQuery.trim() ||
      tip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.body?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleShareTip = (tip: any) => {
    const text = `💡 *The Kitchen Book Tip:* ${tip.title}\n\n${tip.body}\n\nRead more Nigerian kitchen tips on The Kitchen Book 🍳`;
    if (navigator.share) {
      navigator.share({ title: tip.title, text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
          <Lightbulb className="w-3.5 h-3.5 fill-primary" />
          <span>Local Cooking Wisdom</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-serif">
          Nigerian Kitchen Tips & Hacks
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Tested food preservation, pest defense, and cooking secrets stored in real-time from Supabase.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#EAE4D7] rounded-2xl text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-2xs"
          placeholder="Search tips (e.g. beans, weevils, power cuts, tomatoes)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? "bg-primary text-white border-primary shadow-2xs"
                : "bg-white text-foreground/80 border-[#EAE4D7] hover:border-primary/40 hover:bg-sage-light"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Loading kitchen tips from database...</p>
        </div>
      ) : filteredTips.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-[#EAE4D7] text-center text-muted-foreground space-y-2 shadow-xs">
          <Lightbulb className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-semibold text-foreground">No tips found for "{searchQuery}"</p>
          <p className="text-xs">Try searching for something else or reset the category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE4D7] hover:border-primary/40 transition-all shadow-2xs food-card-hover flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    {tip.category}
                  </span>
                  <span className="bg-sage-light text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sage-border/50">
                    Verified Tip
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                  {tip.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {tip.body}
                </p>
              </div>

              {/* Footer Action */}
              <div className="pt-4 mt-4 border-t border-[#F0ECE3] flex items-center justify-between">
                <span className="text-[11px] text-primary font-medium">
                  💡 Kitchen Wisdom
                </span>

                <button
                  onClick={() => handleShareTip(tip)}
                  className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Hack</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
