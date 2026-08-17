"use client";

import { useEffect, useState } from "react";

const PANTRY_STORAGE_KEY = "tkb_pantry_items";

// Default starter staples for Nigerian pantry
export const DEFAULT_STAPLES = [
  "rice",
  "onions",
  "tomatoes",
  "scotch bonnet",
  "palm oil",
  "vegetable oil",
  "maggi",
  "salt",
  "garri",
  "crayfish"
];

export function getStoredPantry(): string[] {
  if (typeof window === "undefined") return DEFAULT_STAPLES;
  try {
    const data = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(DEFAULT_STAPLES));
      return DEFAULT_STAPLES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read pantry from storage", err);
    return DEFAULT_STAPLES;
  }
}

export function savePantry(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(items.map(i => i.trim().toLowerCase()))).filter(Boolean);
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(unique));
    window.dispatchEvent(new Event("tkb_pantry_changed"));
  } catch (err) {
    console.error("Failed to save pantry to storage", err);
  }
}

export function addPantryItem(item: string): string[] {
  const current = getStoredPantry();
  const normalized = item.trim().toLowerCase();
  if (!current.includes(normalized)) {
    const updated = [...current, normalized];
    savePantry(updated);
    return updated;
  }
  return current;
}

export function removePantryItem(item: string): string[] {
  const current = getStoredPantry();
  const normalized = item.trim().toLowerCase();
  const updated = current.filter(i => i !== normalized);
  savePantry(updated);
  return updated;
}

export function togglePantryItem(item: string): { items: string[]; isAdded: boolean } {
  const current = getStoredPantry();
  const normalized = item.trim().toLowerCase();
  const exists = current.includes(normalized);
  const updated = exists ? current.filter(i => i !== normalized) : [...current, normalized];
  savePantry(updated);
  return { items: updated, isAdded: !exists };
}

export function clearPantry(): void {
  savePantry([]);
}

/**
 * Custom React hook for live syncing with the pantry store
 */
export function usePantry() {
  const [items, setItems] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(getStoredPantry());
    setIsReady(true);

    const handleUpdate = () => {
      setItems(getStoredPantry());
    };

    window.addEventListener("tkb_pantry_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("tkb_pantry_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const add = (item: string) => addPantryItem(item);
  const remove = (item: string) => removePantryItem(item);
  const toggle = (item: string) => togglePantryItem(item);
  const clear = () => clearPantry();
  const has = (item: string) => items.includes(item.trim().toLowerCase());

  return {
    items,
    isReady,
    add,
    remove,
    toggle,
    clear,
    has,
    count: items.length
  };
}
