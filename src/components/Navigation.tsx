"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Refrigerator,
  Plus,
  Lightbulb,
  User,
  ChefHat,
  Sparkles,
  X,
  Utensils,
  Camera,
  Heart
} from "lucide-react";
import { usePantry } from "@/lib/pantryStore";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  const pathname = usePathname();
  const { count } = usePantry();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Lock body scroll when modal is open to prevent scroll malfunction
  useEffect(() => {
    if (showCreateModal) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [showCreateModal]);

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pantry", label: "My Pantry", icon: Refrigerator, badge: count > 0 ? count : null },
    { href: "/tips", label: "Kitchen Tips", icon: Lightbulb },
    { href: "/community", label: "Community", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const mobileNavLinks = [
    { href: "/", label: "Home", icon: Home, isAction: false },
    { href: "/pantry", label: "Pantry", icon: Refrigerator, badge: count > 0 ? count : null, isAction: false },
    { href: "/recipe/new", label: "Create", icon: Plus, isAction: true },
    { href: "/tips", label: "Tips", icon: Lightbulb, isAction: false },
    { href: "/profile", label: "Profile", icon: User, isAction: false },
  ];

  return (
    <>
      {/* QUICK CREATE POPUP MODAL */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h3 className="font-display font-bold text-sm sm:text-base text-[var(--cream)]">
                What do you want to create?
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-[var(--surface-warm)] flex items-center justify-center text-[var(--tan)] hover:text-[var(--cream)] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/recipe/new"
                onClick={() => setShowCreateModal(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--surface-warm)] hover:bg-[var(--line)]/20 border border-[var(--line)] transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--pepper)] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[var(--cream)] group-hover:text-[var(--pepper)] transition-colors">
                    Create New Recipe
                  </h4>
                  <p className="text-[11px] text-[var(--tan)] font-body">
                    Add ingredients, steps & photos
                  </p>
                </div>
              </Link>

              <Link
                href="/post"
                onClick={() => setShowCreateModal(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--surface-warm)] hover:bg-[var(--line)]/20 border border-[var(--line)] transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--palm)] text-[var(--ink)] flex items-center justify-center font-bold text-sm shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[var(--cream)] group-hover:text-[var(--palm)] transition-colors">
                    Share Cooked Dish
                  </h4>
                  <p className="text-[11px] text-[var(--tan)] font-body">
                    Post a photo to the community feed
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-[var(--ink)]/95 backdrop-blur-md border-t border-[var(--line)] pb-safe z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-[54px] px-2">
          {mobileNavLinks.map(({ href, label, icon: Icon, isAction, badge }) => {
            const isActive = pathname === href;

            if (isAction) {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex flex-col items-center justify-center flex-1 py-1 transition-all group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)]"
                  aria-label="Create Recipe or Post"
                >
                  <div className="w-[24px] h-[24px] rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--cream)] flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--tan)] mt-[3px] tracking-tight">
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)] ${
                  isActive ? "text-[var(--cream)]" : "text-[var(--tan)] hover:text-[var(--cream)]"
                }`}
              >
                <div
                  className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-[var(--pepper)] text-white"
                      : "text-[var(--tan)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono mt-[3px] tracking-tight">
                  {label}
                </span>
                {badge !== null && badge !== undefined && (
                  <span className="absolute top-0.5 right-4 bg-[var(--pepper)] text-white text-[8px] font-bold px-1 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* CALM & ELEGANT DESKTOP SIDEBAR (230px) */}
      <aside className="hidden md:flex md:flex-col md:w-[230px] md:h-screen md:sticky md:top-0 bg-[var(--surface)] border-r border-[var(--line)] p-4 justify-between flex-shrink-0 z-30">
        <div className="space-y-5">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--pepper)] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              🍳
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base tracking-tight text-[var(--cream)] leading-tight">
                The Kitchen Book
              </h1>
              <p className="text-[10px] font-mono text-[var(--tan)]">
                Your Pantry. Your Recipes.
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            {links.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:ring-1 focus-visible:ring-[var(--pepper)] ${
                    isActive
                      ? "bg-[var(--pepper)] text-white font-bold shadow-xs"
                      : "text-[var(--tan)] hover:bg-[var(--surface-warm)] hover:text-[var(--cream)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white stroke-[2.5]" : "text-[var(--tan)]"}`} />
                    <span>{label}</span>
                  </div>
                  {badge !== null && badge !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white text-[var(--pepper)]" : "bg-[var(--pepper)] text-white"
                    }`}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Subtle Secondary Actions */}
          <div className="pt-2 border-t border-[var(--line)] space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[var(--tan)] uppercase tracking-wider px-2 block mb-1">
              Cookbook Actions
            </span>
            <Link
              href="/recipe/new"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--cream)] bg-[var(--surface-warm)] hover:bg-[var(--line)]/20 border border-[var(--line)] transition-all font-display"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--pepper)] stroke-[2.5]" />
              <span>Create Recipe</span>
            </Link>
            <Link
              href="/post"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--tan)] hover:text-[var(--cream)] hover:bg-[var(--surface-warm)] border border-transparent hover:border-[var(--line)] transition-all font-display"
            >
              <Camera className="w-3.5 h-3.5 text-[var(--palm)]" />
              <span>Share Cooked Dish</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Theme Toggle + Pantry Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 pt-2 border-t border-[var(--line)]">
            <span className="text-[11px] font-mono text-[var(--tan)]">Theme</span>
            <ThemeToggle showLabel={false} />
          </div>

          <div className="bg-[var(--surface-warm)] border border-[var(--line)] rounded-2xl p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[var(--cream)] text-[11px] flex items-center gap-1.5 font-display">
                <ChefHat className="w-3.5 h-3.5 text-[var(--pepper)]" />
                Pantry Ready
              </span>
              <span className="font-mono font-bold text-[var(--palm)] text-[11px]">{count} items</span>
            </div>
            <p className="text-[var(--tan)] text-[10px] mb-2 leading-relaxed font-body">
              {count > 0 ? `${count} ingredients ready to cook.` : "Add what you have in the pantry."}
            </p>
            <Link
              href="/pantry"
              className="block text-center w-full bg-[var(--surface)] hover:bg-[var(--pepper)] hover:text-white border border-[var(--line)] text-[var(--cream)] font-bold py-1 px-2 rounded-lg text-[11px] transition-all font-mono"
            >
              Manage Pantry
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
