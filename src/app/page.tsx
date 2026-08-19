"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { usePantry } from "@/lib/pantryStore";
import { CANONICAL_INGREDIENTS } from "@/components/IngredientSearch";
import AiMealSuggesterModal from "@/components/AiMealSuggesterModal";
import AuthModal from "@/components/AuthModal";
import { ChevronDown, MapPin } from "lucide-react";

export const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
  "Benin City",
  "Kano",
  "Calabar",
  "Asaba"
];

// Helper to determine category for color-coding pantry tags
function getIngredientCategory(name: string): "protein" | "veg" | "spice" {
  const n = name.toLowerCase().trim();
  const canonical = CANONICAL_INGREDIENTS.find(
    (i) => i.name.toLowerCase() === n || i.label.toLowerCase() === n
  );

  if (canonical) {
    if (canonical.category === "protein") return "protein";
    if (canonical.category === "vegetable") return "veg";
    return "spice";
  }

  // Fallback heuristics
  if (
    n.includes("fish") ||
    n.includes("beef") ||
    n.includes("chicken") ||
    n.includes("meat") ||
    n.includes("egg") ||
    n.includes("bean") ||
    n.includes("crayfish") ||
    n.includes("prawn") ||
    n.includes("shrimp") ||
    n.includes("egusi") ||
    n.includes("turkey") ||
    n.includes("goat") ||
    n.includes("snails")
  ) {
    return "protein";
  }

  if (
    n.includes("onion") ||
    n.includes("tomato") ||
    n.includes("leaf") ||
    n.includes("leaves") ||
    n.includes("ugu") ||
    n.includes("ugwu") ||
    n.includes("okra") ||
    n.includes("spinach") ||
    n.includes("ewedu") ||
    n.includes("bitterleaf") ||
    n.includes("efo") ||
    n.includes("waterleaf") ||
    n.includes("cabbage") ||
    n.includes("carrot") ||
    n.includes("pepper")
  ) {
    return "veg";
  }

  return "spice";
}

// 3 Curated & Top-Ranked Mood Cards (The one bold focal moment)
const MOOD_CARDS = [
  {
    id: "broke_week",
    tag: "Broke week",
    label: "Still eating good",
    colorClass: "bg-[var(--pepper)]",
    tagClass: "text-white/85",
    labelClass: "text-white",
  },
  {
    id: "rainy_day",
    tag: "Rainy day",
    label: "Pepper soup weather",
    colorClass: "bg-[var(--ugu)]",
    tagClass: "text-white/85",
    labelClass: "text-white",
  },
  {
    id: "quick",
    tag: "20 minutes",
    label: "In, out, fed",
    colorClass: "bg-[var(--palm)]",
    tagClass: "text-[var(--ink)]/65",
    labelClass: "text-[var(--ink)]",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, count, isReady } = usePantry();

  const [selectedCity, setSelectedCity] = useState("Lagos");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeString, setTimeString] = useState("Wednesday, 7:42am");

  // Dynamic day/time string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" });
      const time = now
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        .toLowerCase()
        .replace(" ", "");
      setTimeString(`${day}, ${time}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Resolved user first name
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "Ugo");

  const avatarInitial = firstName.charAt(0).toUpperCase() || "U";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Pantry display items (max 5 tags + overflow tag)
  const displayItems = isReady ? items.slice(0, 5) : ["onions", "tomatoes", "scotch bonnet", "palm oil", "crayfish"];
  const moreCount = isReady ? Math.max(0, items.length - 5) : 5;
  const totalCount = isReady ? count : 10;

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--cream)] flex justify-center selection:bg-[var(--pepper)] selection:text-[var(--ink)]">
      {/* 380px Frame Container (Responsive down to 360px and scales gracefully) */}
      <div className="w-full max-w-[440px] flex flex-col pb-16">
        
        {/* 1. TOP BAR — ONE ROW: LOCATION · SEARCH INPUT · AVATAR BUTTON */}
        <header className="topbar flex items-center gap-[10px] px-[18px] pt-[18px] w-full">
          {/* Location Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="locale flex items-center gap-[6px] text-[13px] font-semibold text-[var(--cream)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)] rounded-full px-1 py-0.5"
              aria-label="Select city"
            >
              <span className="dot w-[6px] h-[6px] rounded-full bg-[var(--pepper)] shrink-0" />
              <span className="truncate max-w-[70px] xs:max-w-[90px]">{selectedCity}</span>
            </button>

            {/* City Selector Dropdown */}
            {showLocationDropdown && (
              <div className="absolute left-0 mt-2 w-44 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-mono font-bold text-[var(--tan)] uppercase tracking-wider">
                  Select City
                </div>
                {NIGERIAN_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--line)]/20 transition-colors ${
                      selectedCity === city
                        ? "font-bold text-[var(--pepper)] bg-[var(--line)]/10"
                        : "text-[var(--cream)]"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="text-[var(--pepper)] text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input (Flex Fill) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="search recipes, ingredients…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search w-full bg-[var(--surface)] border border-[var(--line)] rounded-[12px] px-[12px] py-[9px] text-[12px] text-[var(--cream)] placeholder:text-[var(--tan)] font-mono focus:outline-none focus:border-[var(--pepper)] focus:ring-1 focus:ring-[var(--pepper)] transition-all"
            />
          </form>

          {/* Avatar Button */}
          <button
            type="button"
            onClick={() => {
              if (user) {
                router.push("/profile");
              } else {
                setShowAuthModal(true);
              }
            }}
            className="avatar-btn shrink-0 w-[28px] h-[28px] rounded-full bg-[var(--pepper)] flex items-center justify-center font-mono text-[11px] font-bold text-[var(--ink)] hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cream)] overflow-hidden"
            aria-label="User Profile"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={firstName}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            ) : (
              avatarInitial
            )}
          </button>
        </header>

        {/* 2. HERO — MONO EYEBROW + BOLD TWO-LINE HEADLINE */}
        <section className="hero px-[18px] pt-[24px]">
          <div className="eyebrow font-mono text-[10.5px] tracking-[0.1em] uppercase text-[var(--palm)] mb-[6px]">
            {timeString}
          </div>
          <h1 className="headline font-display font-extrabold text-[30px] leading-[1.05] tracking-[-0.01em] text-[var(--cream)]">
            What&apos;s <em className="not-italic text-[var(--pepper)]">cooking</em>,<br />
            {firstName}?
          </h1>
        </section>

        {/* 3. PANTRY SECTION — TITLE + ITEM COUNT + COLOR-CODED TAGS */}
        <section className="pantry mx-[18px] mt-[20px] pb-[18px] border-b border-[var(--line)]">
          <div className="pantry-head flex items-baseline justify-between mb-[12px]">
            <h2 className="pantry-title font-display font-bold text-[14px] text-[var(--cream)]">
              Your pantry
            </h2>
            <Link
              href="/pantry"
              className="pantry-count font-mono text-[11.5px] text-[var(--palm)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--palm)] rounded"
            >
              {totalCount} items · edit
            </Link>
          </div>

          <div className="tag-row flex flex-wrap gap-[7px]">
            {displayItems.length > 0 ? (
              <>
                {displayItems.map((item, idx) => {
                  const category = getIngredientCategory(item);
                  let tagClass = "bg-[rgba(255,194,75,0.16)] text-[var(--palm)]"; // default spice/other

                  if (category === "protein") {
                    tagClass = "bg-[rgba(255,90,54,0.16)] text-[#FF8A6B]";
                  } else if (category === "veg") {
                    tagClass = "bg-[rgba(63,125,92,0.22)] text-[var(--ugu-light)]";
                  }

                  return (
                    <span
                      key={`${item}-${idx}`}
                      className={`tag px-[11px] py-[6px] rounded-[20px] text-[12px] font-semibold capitalize ${tagClass}`}
                    >
                      {item}
                    </span>
                  );
                })}

                {moreCount > 0 && (
                  <Link
                    href="/pantry"
                    className="tag more bg-transparent border border-[var(--line)] text-[var(--tan)] hover:text-[var(--cream)] hover:border-[var(--tan)] px-[11px] py-[6px] rounded-[20px] text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)]"
                  >
                    +{moreCount} more
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/pantry"
                className="tag more bg-transparent border border-[var(--line)] text-[var(--tan)] hover:text-[var(--cream)] hover:border-[var(--pepper)] px-[14px] py-[8px] rounded-[20px] text-[12px] font-semibold transition-colors"
              >
                + Add your first kitchen ingredient
              </Link>
            )}
          </div>
        </section>

        {/* 4. "COOK YOUR MOOD" SHELF — 3 SENSORY SPRINT CARDS */}
        <section className="shelf mt-[22px]">
          <div className="shelf-head flex items-baseline justify-between px-[18px] mb-[12px]">
            <h2 className="shelf-title font-display font-bold text-[16px] text-[var(--cream)]">
              Cook your mood
            </h2>
          </div>

          <div className="mood-scroll flex gap-[10px] overflow-x-auto px-[18px] pb-[4px] hide-scrollbar">
            {MOOD_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => router.push(`/search?mood=${card.id}`)}
                className={`mood-card shrink-0 w-[150px] h-[150px] rounded-[16px] p-[14px] flex flex-col justify-between text-left transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cream)] ${card.colorClass}`}
                aria-label={`Cook mood: ${card.tag} - ${card.label}`}
              >
                <span className={`mood-tag font-mono text-[9.5px] uppercase tracking-[0.06em] ${card.tagClass}`}>
                  {card.tag}
                </span>
                <span className={`mood-label font-display font-extrabold text-[17px] leading-[1.1] ${card.labelClass}`}>
                  {card.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 5. "ASK CHEF AI" ROW — QUIET OUTLINED CARD */}
        <section className="cta-row mx-[18px] mt-[24px]">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="cta w-full bg-[var(--surface)] border border-[var(--line)] rounded-[16px] p-[15px_16px] flex items-center justify-between text-left hover:border-[var(--pepper)]/40 active:scale-[0.99] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pepper)]"
          >
            <div>
              <div className="cta-text font-display font-bold text-[14px] text-[var(--cream)] group-hover:text-[var(--pepper)] transition-colors">
                Ask Chef AI
              </div>
              <div className="cta-sub text-[11.5px] text-[var(--tan)] mt-[2px] font-body">
                Stuck? Describe your fridge.
              </div>
            </div>
            <div
              className="cta-arrow shrink-0 w-[30px] h-[30px] rounded-full bg-[var(--pepper)] text-[var(--ink)] flex items-center justify-center text-[13px] font-bold group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              →
            </div>
          </button>
        </section>

      </div>

      {/* Interactive Modals */}
      <AiMealSuggesterModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
