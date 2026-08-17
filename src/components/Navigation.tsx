"use client";

import { useState } from "react";
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

export default function Navigation() {
  const pathname = usePathname();
  const { count } = usePantry();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pantry", label: "My Pantry", icon: Refrigerator, badge: count > 0 ? count : null },
    { href: "/tips", label: "Kitchen Tips", icon: Lightbulb },
    { href: "/community", label: "Community", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const mobileNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pantry", label: "Pantry", icon: Refrigerator, badge: count > 0 ? count : null },
    { href: "#create", label: "Create", icon: Plus, isAction: true },
    { href: "/tips", label: "Tips", icon: Lightbulb },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* QUICK CREATE POPUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                What do you want to create?
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/recipe/new"
                onClick={() => setShowCreateModal(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-sage-light hover:bg-primary-light border border-sage-border/60 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                    Create New Recipe
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Add ingredients, steps & photos
                  </p>
                </div>
              </Link>

              <Link
                href="/post"
                onClick={() => setShowCreateModal(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-card-warm hover:bg-muted border border-border transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                    Share Cooked Dish
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Post a photo to the community feed
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION (Fixed, clean) */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-card/95 backdrop-blur-md border-t border-border/80 pb-safe z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center h-15 px-2">
          {mobileNavLinks.map(({ href, label, icon: Icon, isAction, badge }) => {
            const isActive = pathname === href;

            if (isAction) {
              return (
                <button
                  key={href}
                  onClick={() => setShowCreateModal(true)}
                  className="flex flex-col items-center -mt-4 group"
                  aria-label="Create Recipe or Post"
                >
                  <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/80 mt-0.5">
                    Create
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : ""}`} />
                  {badge !== null && badge !== undefined && (
                    <span className="absolute -top-1 -right-2.5 bg-accent text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ring-2 ring-card shadow-2xs">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium tracking-tight">
                  {label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 bg-primary rounded-full absolute -bottom-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* CALM & ELEGANT DESKTOP SIDEBAR (230px) */}
      <aside className="hidden md:flex md:flex-col md:w-[230px] md:h-screen md:sticky md:top-0 bg-card border-r border-border p-4 justify-between flex-shrink-0 z-30">
        <div className="space-y-5">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              🍳
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-primary leading-tight font-serif">
                The Kitchen Book
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-sage-light text-primary font-bold border border-sage-border/50"
                      : "text-foreground/75 hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary stroke-[2.5]" : "text-muted-foreground"}`} />
                    <span>{label}</span>
                  </div>
                  {badge !== null && badge !== undefined && (
                    <span className="bg-primary/10 text-primary font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Subtle Secondary Actions */}
          <div className="pt-2 border-t border-border/60 space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-1">
              Cookbook Actions
            </span>
            <Link
              href="/recipe/new"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-sage-light/40 hover:bg-sage-light border border-sage-border/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Recipe</span>
            </Link>
            <Link
              href="/post"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/75 hover:bg-muted border border-transparent hover:border-border transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Share Cooked Dish</span>
            </Link>
          </div>
        </div>

        {/* Calm Bottom Pantry Summary */}
        <div className="bg-[#FAF7F2] border border-border rounded-2xl p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-primary text-[11px] flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              Pantry Ready
            </span>
            <span className="font-bold text-primary text-[11px]">{count} items</span>
          </div>
          <p className="text-muted-foreground text-[10px] mb-2 leading-relaxed">
            {count > 0 ? `${count} ingredients available to match recipes.` : "Add what you have at home."}
          </p>
          <Link
            href="/pantry"
            className="block text-center w-full bg-white hover:bg-primary hover:text-white border border-border text-primary font-bold py-1 px-2 rounded-lg text-[11px] transition-all shadow-2xs"
          >
            Manage Pantry
          </Link>
        </div>
      </aside>
    </>
  );
}
