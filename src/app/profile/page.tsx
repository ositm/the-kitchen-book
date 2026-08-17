"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePantry } from "@/lib/pantryStore";
import { User, MapPin, ChefHat, Heart, BookOpen, Settings, Flame, Sparkles, Refrigerator } from "lucide-react";

export const SAVED_RECIPES_SAMPLE = [
  {
    slug: "classic-nigerian-jollof-rice",
    title: "Classic Nigerian Jollof Rice",
    cook_time: "90m",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80",
    match: 95
  },
  {
    slug: "egusi-soup-with-bitterleaf",
    title: "Egusi Soup with Bitterleaf",
    cook_time: "60m",
    image: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=400&q=80",
    match: 80
  },
  {
    slug: "ewa-agoyin-with-fried-plantain",
    title: "Ewa Agoyin with Fried Plantain",
    cook_time: "45m",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    match: 100
  }
];

export default function ProfilePage() {
  const { count, items } = usePantry();
  const [activeTab, setActiveTab] = useState<"saved" | "pantry" | "activity">("saved");

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-2xl mx-auto">
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 border border-[#EAE4D7] shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-full bg-sage-light text-primary border-2 border-sage-border flex items-center justify-center text-3xl shadow-xs">
            👨🏾‍🍳
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground font-serif">
                Chef Ugo
              </h1>
              <span className="bg-sage-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-sage-border/50">
                Master Cook
              </span>
            </div>

            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Lagos State, Nigeria</span>
            </p>

            <p className="text-xs text-foreground/80 pt-1 max-w-sm">
              Passionate home cook exploring authentic Nigerian soups, party jollof dishes, and smart weeknight hacks.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-[#F0ECE3] text-center">
          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-border/50">
            <span className="text-lg font-extrabold text-primary block">14</span>
            <span className="text-[11px] font-medium text-muted-foreground">Dishes Cooked</span>
          </div>
          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-border/50">
            <span className="text-lg font-extrabold text-accent block">8</span>
            <span className="text-[11px] font-medium text-muted-foreground">Saved Recipes</span>
          </div>
          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-border/50">
            <span className="text-lg font-extrabold text-[#2E8B57] block">{count}</span>
            <span className="text-[11px] font-medium text-muted-foreground">Pantry Items</span>
          </div>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex items-center gap-2 border-b border-[#EAE4D7] pb-2">
        {[
          { id: "saved", label: "❤️ Saved Recipes" },
          { id: "pantry", label: `🧺 My Pantry (${count})` },
          { id: "activity", label: "✨ Activity" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "saved" && (
        <div className="space-y-3">
          {SAVED_RECIPES_SAMPLE.map((recipe) => (
            <Link
              key={recipe.slug}
              href={`/recipe/${recipe.slug}`}
              className="flex items-center gap-3.5 p-3.5 bg-white hover:bg-sage-light/30 border border-[#EAE4D7] rounded-2xl transition-all shadow-2xs food-card-hover group"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF7F2] flex-shrink-0">
                <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {recipe.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>⏱️ {recipe.cook_time}</span>
                  <span>•</span>
                  <span className="text-[#2E8B57] font-bold">{recipe.match}% Match</span>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">Cook →</span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "pantry" && (
        <div className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Current Kitchen Inventory</h3>
            <Link href="/pantry" className="text-xs font-bold text-primary hover:underline">
              Manage in Pantry →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="capitalize bg-sage-light text-primary border border-sage-border/60 font-semibold text-xs px-3 py-1.5 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE4D7] shadow-xs text-center text-muted-foreground space-y-2">
          <Sparkles className="w-8 h-8 text-accent mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Cook & Share Badges</h3>
          <p className="text-xs max-w-xs mx-auto">
            You've cooked 14 recipes with pantry matches. Keep exploring more Nigerian dishes!
          </p>
        </div>
      )}
    </div>
  );
}
