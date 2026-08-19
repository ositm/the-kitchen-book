"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { MapPin, Bell, ChevronDown, User, Search, Sparkles, LogOut, ShieldCheck, X } from "lucide-react";

export const NIGERIAN_CITIES = [
  "Lagos, Nigeria",
  "Abuja, FCT, Nigeria",
  "Port Harcourt, Rivers",
  "Ibadan, Oyo",
  "Enugu, Enugu State",
  "Benin City, Edo",
  "Kano, Kano State",
  "Calabar, Cross River",
  "Asaba, Delta State"
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [selectedCity, setSelectedCity] = useState("Lagos, Nigeria");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showHeaderUserMenu, setShowHeaderUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [hasNotification, setHasNotification] = useState(true);

  // Home screen has its own integrated Top bar matching mockup v2 exactly
  if (pathname === "/") {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Chef Ugo";

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      <header className="w-full bg-background/95 backdrop-blur-md sticky top-0 z-40 border-b border-border shadow-2xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-2.5 sm:px-6 md:px-8 space-y-2 sm:space-y-0">
          {/* Main Top Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Brand & Location Selector */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link href="/" className="md:hidden flex items-center gap-1.5 font-bold text-sm text-primary font-serif">
                <span className="text-base">🍳</span>
                <span className="hidden xs:inline">The Kitchen Book</span>
              </Link>

              {/* Location Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-semibold text-foreground/85 bg-card hover:bg-muted border border-border px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full shadow-2xs transition-all active:scale-98"
                  aria-label="Select location"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate max-w-[95px] xs:max-w-[120px] sm:max-w-[150px]">
                    {selectedCity.split(",")[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute left-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Select Location
                    </div>
                    {NIGERIAN_CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-sage-light hover:text-primary transition-colors ${
                          selectedCity === city ? "font-bold text-primary bg-sage-light/50" : "text-foreground"
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Center: Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xs md:max-w-sm relative mx-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipes, ingredients..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-card border border-border rounded-full text-xs text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={() => setHeaderSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Right: Theme Toggle, Notifications, and Sign In / Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ThemeToggle />

              <button
                onClick={() => setHasNotification(false)}
                className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-colors border border-border bg-card shadow-2xs"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {hasNotification && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-card" />
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowHeaderUserMenu(!showHeaderUserMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1 pr-2 sm:pr-2.5 bg-card hover:bg-muted border border-border rounded-full shadow-2xs transition-all active:scale-98"
                    aria-label="My Cooking Profile"
                  >
                    {avatarUrl ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-primary/20 flex-shrink-0">
                        <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        👨🏾‍🍳
                      </div>
                    )}
                    <span className="text-xs font-semibold text-foreground max-w-[80px] sm:max-w-[100px] truncate">
                      {displayName.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {showHeaderUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-border-light">
                        <span className="font-bold text-xs text-foreground block truncate">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {user.email}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setShowHeaderUserMenu(false)}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-foreground hover:bg-sage-light hover:text-primary transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/pantry"
                        onClick={() => setShowHeaderUserMenu(false)}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-foreground hover:bg-sage-light hover:text-primary transition-colors"
                      >
                        <span>🧺</span>
                        <span>My Pantry</span>
                      </Link>

                      <button
                        onClick={() => {
                          signOut();
                          setShowHeaderUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-red-600 hover:bg-red-500/10 transition-colors border-t border-border-light"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 bg-card hover:bg-sage-light border border-border text-foreground hover:text-primary text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full shadow-2xs transition-all active:scale-98"
                  aria-label="Sign In"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar (Row 2 on phones - Always Sticky in Header!) */}
          <form onSubmit={handleSearchSubmit} className="sm:hidden w-full relative pt-0.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, stews..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 bg-card-warm border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
            />
            {headerSearch && (
              <button
                type="button"
                onClick={() => setHeaderSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
