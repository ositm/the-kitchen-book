"use client";

import { useState } from "react";
import { X, ShoppingCart, Share2, ExternalLink, MapPin, CheckCircle2, MessageCircle } from "lucide-react";

interface MissingIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  missingIngredients: Array<{
    name: string;
    qty?: string | number;
    unit?: string;
  }>;
  cityName?: string;
}

export const VENDORS = [
  {
    id: "chowdeck",
    name: "Chowdeck",
    logo: "🛵",
    description: "Fast 30-min grocery & ingredient delivery in Lagos & Abuja",
    url: "https://chowdeck.com"
  },
  {
    id: "glovo",
    name: "Glovo",
    logo: "🟡",
    description: "Supermarkets, open markets & pharmacy delivery",
    url: "https://glovoapp.com/ng"
  },
  {
    id: "jumia",
    name: "Jumia Food & Market",
    logo: "🛒",
    description: "Bulk pantry groceries, spices & non-perishables",
    url: "https://www.jumia.com.ng/groceries"
  },
  {
    id: "supermart",
    name: "Supermart.ng",
    logo: "🥬",
    description: "Fresh vegetables, local Nigerian soup ingredients & meats",
    url: "https://www.supermart.ng"
  },
  {
    id: "local_market",
    name: "Find Open Market Near Me",
    logo: "📍",
    description: "Locate Mile 12, Bodija, Ogbete, Utako or nearest local market",
    url: "https://www.google.com/maps/search/open+food+market+near+me"
  }
];

export default function MissingIngredientsModal({
  isOpen,
  onClose,
  recipeTitle,
  missingIngredients,
  cityName = "Lagos State, Nigeria"
}: MissingIngredientsModalProps) {
  if (!isOpen) return null;

  // Generate WhatsApp shopping list text
  const generateWhatsAppShare = () => {
    const listText = missingIngredients
      .map((item, idx) => `${idx + 1}. ${item.name}${item.qty ? ` (${item.qty} ${item.unit || ""})` : ""}`)
      .join("\n");

    const message = `🛒 *The Kitchen Book — Shopping List*\nFor: *${recipeTitle}*\nLocation: 📍 ${cityName}\n\n*Missing Ingredients to buy:*\n${listText}\n\nGenerated with The Kitchen Book 🍳`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg leading-tight">
                Buy Missing Ingredients
              </h3>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>Available near {cityName.split(",")[0]}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Missing Ingredients Checklist */}
          <div>
            <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider block mb-2.5">
              Items to Buy ({missingIngredients.length})
            </span>
            <div className="bg-muted/50 rounded-2xl p-3 border border-border/80 space-y-1.5">
              {missingIngredients.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs md:text-sm py-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="font-semibold capitalize text-foreground">{item.name}</span>
                  </div>
                  {item.qty && (
                    <span className="text-muted-foreground font-medium text-xs">
                      {item.qty} {item.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={generateWhatsAppShare}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-2xl shadow-sm active:scale-98 transition-all text-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Send Shopping List to WhatsApp</span>
          </button>

          {/* Local Vendors List */}
          <div>
            <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider block mb-2.5">
              Order Online or Find Local Stores
            </span>
            <div className="space-y-2.5">
              {VENDORS.map((vendor) => (
                <a
                  key={vendor.id}
                  href={vendor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-card hover:bg-primary-light/40 border border-border hover:border-primary/40 rounded-2xl transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                      {vendor.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {vendor.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {vendor.description}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
