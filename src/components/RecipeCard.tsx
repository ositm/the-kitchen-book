"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePantry } from "@/lib/pantryStore";
import { calculateRecipeMatch } from "@/lib/matchingEngine";
import { Clock, Star, Heart, Flame, Sparkles, ArrowRight } from "lucide-react";

interface RecipeCardProps {
  id?: string;
  slug: string;
  title: string;
  image_url: string;
  cook_time_mins: number;
  cuisine: string;
  cost_level?: number;
  matchScore?: number;
  haveCount?: number;
  totalCount?: number;
  recipeIngredients?: any[];
  rating?: number;
  calories?: number;
  region?: string;
}

export default function RecipeCard({
  slug,
  title,
  image_url,
  cook_time_mins,
  cuisine,
  cost_level = 2,
  matchScore: explicitMatchScore,
  haveCount: explicitHaveCount,
  totalCount: explicitTotalCount,
  recipeIngredients,
  rating = 4.8,
  region
}: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { items: pantryItems } = usePantry();

  // Compute live match if recipeIngredients provided
  let matchScore = explicitMatchScore;
  let haveCount = explicitHaveCount;
  let totalCount = explicitTotalCount;

  if (matchScore === undefined && recipeIngredients && recipeIngredients.length > 0) {
    const computed = calculateRecipeMatch(recipeIngredients, pantryItems);
    matchScore = computed.matchScore;
    haveCount = computed.haveCount;
    totalCount = computed.totalCount;
  }

  // Estimated Nigerian cost
  const estimatedCost = cost_level === 1 ? "₦1,800" : cost_level === 2 ? "₦3,500" : "₦8,200";

  // Match score visual styling
  let badgeColor = "bg-[var(--pepper)] text-white";
  if (matchScore !== undefined) {
    if (matchScore >= 80) badgeColor = "bg-[var(--pepper)] text-white";
    else if (matchScore >= 50) badgeColor = "bg-[var(--palm)] text-[var(--ink)]";
    else badgeColor = "bg-[var(--surface-warm)] text-[var(--tan)]";
  }

  const cuisineLabel = cuisine?.toLowerCase() === "nigerian" && region 
    ? `${region} food` 
    : cuisine || "Nigerian";

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-2xs food-card-hover transition-all">
      {/* Top Image Container */}
      <Link href={`/recipe/${slug}`} className="relative h-44 sm:h-48 w-full bg-card-warm overflow-hidden block">
        <Image
          src={image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

        {/* Top Badges: Match Score & Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {matchScore !== undefined ? (
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm flex items-center gap-1 ${badgeColor}`}>
              <Flame className="w-3 h-3 fill-white" />
              <span>{matchScore}% MATCH</span>
            </div>
          ) : (
            <div className="bg-card/95 backdrop-blur-md text-foreground px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs border border-border/50">
              <span className="capitalize">{cuisineLabel}</span>
            </div>
          )}

          {/* Rating */}
          <div className="bg-card/95 backdrop-blur-md text-foreground px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-2xs border border-border/50">
            <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bottom overlay: Cook time & Price */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-semibold drop-shadow-md pointer-events-none">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{cook_time_mins} mins</span>
          </div>
          <span className="bg-primary/95 text-white font-bold px-2 py-0.5 rounded-lg shadow-xs text-[11px]">
            {estimatedCost}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-card">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/recipe/${slug}`} className="hover:text-primary transition-colors flex-1">
              <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug line-clamp-2">
                {title}
              </h3>
            </Link>

            {/* Favorite Bookmark button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1 rounded-full text-muted-foreground hover:text-error transition-colors"
              aria-label="Save recipe"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-error text-error" : ""}`} />
            </button>
          </div>

          {/* Have / Total ingredient counts indicator */}
          {haveCount !== undefined && totalCount !== undefined && (
            <p className="text-[11px] text-[var(--tan)] mt-1.5 flex items-center gap-1 font-medium">
              <span className={haveCount === totalCount ? "text-[var(--pepper)] font-bold" : "text-[var(--cream)] font-semibold"}>
                You have {haveCount} of {totalCount}
              </span>
              <span>ingredients</span>
            </p>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 border-t border-border-light flex items-center justify-between text-xs">
          <span className="capitalize bg-card-warm px-2 py-0.5 rounded-md text-muted-foreground font-medium text-[11px] border border-border/50">
            {cuisineLabel}
          </span>

          <Link
            href={`/recipe/${slug}`}
            className="text-primary font-bold hover:text-accent transition-colors flex items-center gap-0.5 text-xs"
          >
            <span>Cook this</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
