"use client";

import { useState, useEffect } from "react";

export interface CustomMood {
  id: string;
  tag: string;
  label: string;
  context: string;
  color: "pepper" | "berry" | "palm" | "amber" | "terracotta";
  isCustom?: boolean;
}

export const DEFAULT_MOODS: CustomMood[] = [
  {
    id: "broke_week",
    tag: "Broke week",
    label: "Still eating good",
    context: "Budget-friendly meals, smart pantry hacks, tasty staples under ₦2,000",
    color: "pepper"
  },
  {
    id: "rainy_day",
    tag: "Rainy day",
    label: "Pepper soup weather",
    context: "Hot spicy broths, soothing pepper soups, ginger, goat meat & fish",
    color: "berry"
  },
  {
    id: "quick",
    tag: "20 minutes",
    label: "In, out, fed",
    context: "Fast 20-minute dinners, quick stir-frys, egg sauce & yam fries",
    color: "palm"
  }
];

export const MOOD_COLOR_MAP = {
  pepper: {
    bg: "bg-[var(--pepper)]",
    text: "text-white",
    tagText: "text-white/90",
    preview: "#FF5A36",
    label: "Pepper Red"
  },
  berry: {
    bg: "bg-[var(--berry)]",
    text: "text-white",
    tagText: "text-white/90",
    preview: "#8B3A5A",
    label: "Berry Plum"
  },
  palm: {
    bg: "bg-[var(--palm)]",
    text: "text-[var(--ink)]",
    tagText: "text-[var(--ink)]/75",
    preview: "#FFC24B",
    label: "Palm Amber"
  },
  amber: {
    bg: "bg-[#D97706]",
    text: "text-white",
    tagText: "text-white/90",
    preview: "#D97706",
    label: "Warm Amber"
  },
  terracotta: {
    bg: "bg-[#C2410C]",
    text: "text-white",
    tagText: "text-white/90",
    preview: "#C2410C",
    label: "Terracotta"
  }
};

const MOODS_STORAGE_KEY = "tkb_custom_moods_v2";

export function getStoredMoods(): CustomMood[] {
  if (typeof window === "undefined") return DEFAULT_MOODS;
  try {
    const data = localStorage.getItem(MOODS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(DEFAULT_MOODS));
      return DEFAULT_MOODS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MOODS;
  } catch (err) {
    console.error("Failed to read moods from storage", err);
    return DEFAULT_MOODS;
  }
}

export function saveMoods(moods: CustomMood[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(moods));
    window.dispatchEvent(new Event("tkb_moods_changed"));
  } catch (err) {
    console.error("Failed to save moods to storage", err);
  }
}

export function addCustomMood(mood: Omit<CustomMood, "id">): CustomMood[] {
  const current = getStoredMoods();
  const id = "custom_" + Date.now().toString(36);
  const newMood: CustomMood = { ...mood, id, isCustom: true };
  const updated = [newMood, ...current];
  saveMoods(updated);
  return updated;
}

export function updateCustomMood(id: string, updates: Partial<CustomMood>): CustomMood[] {
  const current = getStoredMoods();
  const updated = current.map(m => m.id === id ? { ...m, ...updates } : m);
  saveMoods(updated);
  return updated;
}

export function deleteCustomMood(id: string): CustomMood[] {
  const current = getStoredMoods();
  const updated = current.filter(m => m.id !== id);
  const finalMoods = updated.length > 0 ? updated : DEFAULT_MOODS;
  saveMoods(finalMoods);
  return finalMoods;
}

export function resetToDefaultMoods(): CustomMood[] {
  saveMoods(DEFAULT_MOODS);
  return DEFAULT_MOODS;
}

export function useMoods() {
  const [moods, setMoods] = useState<CustomMood[]>(DEFAULT_MOODS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMoods(getStoredMoods());
    setIsReady(true);

    const handleUpdate = () => {
      setMoods(getStoredMoods());
    };

    window.addEventListener("tkb_moods_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("tkb_moods_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    moods,
    isReady,
    addMood: addCustomMood,
    updateMood: updateCustomMood,
    deleteMood: deleteCustomMood,
    resetMoods: resetToDefaultMoods
  };
}
