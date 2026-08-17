"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Bell, ChevronDown, User, Search, Sparkles } from "lucide-react";

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
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("Lagos, Nigeria");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [hasNotification, setHasNotification] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  return (
    <header className="w-full bg-[#FFF9ED]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EAE4D7] px-4 py-2.5 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Location Switcher & Mobile Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="md:hidden flex items-center gap-1.5 font-bold text-sm text-primary font-serif">
            <span>🍳</span>
            <span>The Kitchen Book</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 bg-white hover:bg-muted border border-border px-3 py-1.5 rounded-full shadow-2xs transition-all"
              aria-label="Select delivery city"
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-[160px]">{selectedCity.split(",")[0]}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 mt-2 w-52 bg-white border border-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Select Location
                </div>
                {NIGERIAN_CITIES.map((city) => (
                  <button
                    key={city}
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

        {/* Center: Search Bar (Desktop / Tablet) */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recipes, ingredients..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-border rounded-full text-xs text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </form>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasNotification(false)}
            className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {hasNotification && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-[#FFF9ED]" />
            )}
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 pl-1 pr-2.5 bg-white hover:bg-muted/70 border border-border rounded-full shadow-2xs transition-all"
            aria-label="My Cooking Profile"
          >
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              👨🏾‍🍳
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              Chef Ugo
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
