"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePantry } from "@/lib/pantryStore";
import { useAuth } from "@/lib/authContext";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import {
  User,
  MapPin,
  ChefHat,
  Heart,
  BookOpen,
  Settings,
  Flame,
  Sparkles,
  Refrigerator,
  LogOut,
  LogIn,
  Moon,
  Sun
} from "lucide-react";

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
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<"saved" | "pantry" | "activity" | "settings">("saved");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Chef";

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] shadow-sm relative overflow-hidden">
        {user ? (
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar */}
            {avatarUrl ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--pepper)] shadow-xs">
                <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
              </div>
            ) : (
              <div className="relative w-20 h-20 rounded-full bg-[var(--surface-warm)] text-[var(--pepper)] border-2 border-[var(--line)] flex items-center justify-center text-3xl shadow-xs">
                👨🏾‍🍳
              </div>
            )}

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--cream)] font-display truncate">
                  {displayName}
                </h1>
                <span className="bg-[var(--pepper)]/15 text-[var(--pepper)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--pepper)]/30 flex-shrink-0 font-mono">
                  Google Verified
                </span>
              </div>

              <p className="text-xs text-[var(--tan)] truncate font-mono">{user.email}</p>

              <p className="text-xs text-[var(--tan)] flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--pepper)]" />
                <span>Lagos State, Nigeria</span>
              </p>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all self-center sm:self-start bg-[var(--surface)] shadow-2xs font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[var(--pepper)]/15 text-[var(--pepper)] flex items-center justify-center text-3xl mx-auto shadow-2xs border border-[var(--pepper)]/30">
              👨🏾‍🍳
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--cream)] font-display">
                Join The Kitchen Book
              </h2>
              <p className="text-xs text-[var(--tan)] max-w-sm mx-auto mt-1 font-body">
                Sign in with Google to sync your pantry items across all your devices, save recipes, and share your cooked dishes.
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 bg-[var(--pepper)] hover:opacity-90 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-sm transition-all active:scale-98 font-display"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-[var(--line)] text-center">
          <div className="bg-[var(--surface-warm)] p-2.5 rounded-2xl border border-[var(--line)]">
            <span className="text-lg font-extrabold text-[var(--pepper)] block font-display">14</span>
            <span className="text-[11px] font-medium text-[var(--tan)] font-mono">Cooked</span>
          </div>
          <div className="bg-[var(--surface-warm)] p-2.5 rounded-2xl border border-[var(--line)]">
            <span className="text-lg font-extrabold text-[var(--palm)] block font-display">8</span>
            <span className="text-[11px] font-medium text-[var(--tan)] font-mono">Saved</span>
          </div>
          <div className="bg-[var(--surface-warm)] p-2.5 rounded-2xl border border-[var(--line)]">
            <span className="text-lg font-extrabold text-[var(--berry)] block font-display">{count}</span>
            <span className="text-[11px] font-medium text-[var(--tan)] font-mono">Pantry</span>
          </div>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: "saved", label: "❤️ Saved" },
          { id: "pantry", label: `🧺 Pantry (${count})` },
          { id: "activity", label: "✨ Activity" },
          { id: "settings", label: "⚙️ Preferences" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all font-mono ${
              activeTab === tab.id
                ? "bg-[var(--pepper)] text-white shadow-2xs"
                : "text-[var(--tan)] hover:text-[var(--cream)] hover:bg-[var(--surface)]"
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
              className="flex items-center gap-3.5 p-3.5 bg-[var(--surface)] hover:bg-[var(--surface-warm)] border border-[var(--line)] rounded-2xl transition-all shadow-2xs group"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface-warm)] flex-shrink-0">
                <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[var(--cream)] truncate group-hover:text-[var(--pepper)] transition-colors font-display">
                  {recipe.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[var(--tan)] mt-1 font-mono">
                  <span>⏱️ {recipe.cook_time}</span>
                  <span>•</span>
                  <span className="text-[var(--pepper)] font-bold">{recipe.match}% Match</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[var(--pepper)] font-mono">Cook →</span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "pantry" && (
        <div className="bg-[var(--surface)] rounded-3xl p-5 border border-[var(--line)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--cream)] font-mono uppercase">Current Kitchen Inventory</h3>
            <Link href="/pantry" className="text-xs font-bold text-[var(--pepper)] hover:underline font-mono">
              Manage in Pantry →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="capitalize bg-[var(--palm)]/15 text-[var(--palm)] border border-[var(--palm)]/30 font-semibold text-xs px-3 py-1.5 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] shadow-sm text-center text-[var(--tan)] space-y-2">
          <Sparkles className="w-8 h-8 text-[var(--palm)] mx-auto" />
          <h3 className="text-sm font-bold text-[var(--cream)] font-display">Cook & Share Badges</h3>
          <p className="text-xs max-w-xs mx-auto font-body">
            You've cooked 14 recipes with pantry matches. Keep exploring more Nigerian dishes!
          </p>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--cream)] font-display">Application Preferences</h3>
          
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-warm)] border border-[var(--line)]">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--cream)]">App Theme</h4>
              <p className="text-[11px] text-[var(--tan)]">Toggle between Warm Light and Rich Dark mode</p>
            </div>
            <ThemeToggle showLabel={true} />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-warm)] border border-[var(--line)]">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--cream)]">Default City</h4>
              <p className="text-[11px] text-[var(--tan)]">Lagos State, Nigeria</p>
            </div>
            <span className="text-xs font-semibold text-[var(--pepper)] font-mono">Active</span>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
