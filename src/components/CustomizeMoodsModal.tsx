"use client";

import { useState } from "react";
import { X, Plus, Trash2, Edit3, RotateCcw, Sparkles, Check } from "lucide-react";
import { useMoods, CustomMood, MOOD_COLOR_MAP } from "@/lib/moodStore";

interface CustomizeMoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomizeMoodsModal({ isOpen, onClose }: CustomizeMoodsModalProps) {
  const { moods, addMood, updateMood, deleteMood, resetMoods } = useMoods();

  const [editingMoodId, setEditingMoodId] = useState<string | null>(null);
  const [tag, setTag] = useState("");
  const [label, setLabel] = useState("");
  const [context, setContext] = useState("");
  const [color, setColor] = useState<CustomMood["color"]>("pepper");
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingMoodId(null);
    setTag("");
    setLabel("");
    setContext("");
    setColor("pepper");
  };

  const startEdit = (mood: CustomMood) => {
    setEditingMoodId(mood.id);
    setIsAddingNew(false);
    setTag(mood.tag);
    setLabel(mood.label);
    setContext(mood.context);
    setColor(mood.color);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim() || !label.trim()) return;

    if (isAddingNew) {
      addMood({
        tag: tag.trim(),
        label: label.trim(),
        context: context.trim() || "Delicious curated dishes matching your vibe",
        color
      });
      setIsAddingNew(false);
    } else if (editingMoodId) {
      updateMood(editingMoodId, {
        tag: tag.trim(),
        label: label.trim(),
        context: context.trim(),
        color
      });
      setEditingMoodId(null);
    }

    setTag("");
    setLabel("");
    setContext("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--surface)] border border-[var(--line)] w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--cream)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--pepper)]" />
              Customize Cooking Moods
            </h2>
            <p className="text-xs text-[var(--tan)] mt-0.5">
              Add your own moods or customize recipe context triggers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--ink)] flex items-center justify-center text-[var(--tan)] hover:text-[var(--cream)] border border-[var(--line)]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New or Edit Form */}
        {(isAddingNew || editingMoodId) && (
          <form onSubmit={handleSave} className="bg-[var(--ink)] border border-[var(--line)] p-4 sm:p-5 rounded-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[var(--cream)]">
                {isAddingNew ? "+ Create New Mood" : "Edit Mood"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingMoodId(null);
                }}
                className="text-xs text-[var(--tan)] hover:text-[var(--cream)]"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[var(--tan)] uppercase mb-1">
                  Mood Tag (e.g. &quot;Post Gym&quot;, &quot;Late Night&quot;, &quot;Sunday Feast&quot;)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Protein"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--cream)] placeholder:text-[var(--tan)]/60 focus:outline-none focus:border-[var(--pepper)] focus:ring-1 focus:ring-[var(--pepper)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[var(--tan)] uppercase mb-1">
                  Headline Label (e.g. &quot;Muscle fuel & soup&quot;, &quot;Quick midnight bites&quot;)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Egg & fish refuel"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--cream)] placeholder:text-[var(--tan)]/60 focus:outline-none focus:border-[var(--pepper)] focus:ring-1 focus:ring-[var(--pepper)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[var(--tan)] uppercase mb-1">
                  Context / Ingredients Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Heavy on boiled eggs, grilled chicken, beans, low carbs, high protein"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--cream)] placeholder:text-[var(--tan)]/60 focus:outline-none focus:border-[var(--pepper)] focus:ring-1 focus:ring-[var(--pepper)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[var(--tan)] uppercase mb-1.5">
                  Card Color Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(MOOD_COLOR_MAP) as Array<keyof typeof MOOD_COLOR_MAP>).map((cKey) => {
                    const c = MOOD_COLOR_MAP[cKey];
                    const isSelected = color === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setColor(cKey)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? "border-white ring-2 ring-[var(--pepper)] shadow-sm"
                            : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.preview, color: cKey === "palm" ? "#141310" : "#ffffff" }}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--pepper)] hover:opacity-90 text-white font-display font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-98"
            >
              {isAddingNew ? "Add Mood Shelf" : "Save Changes"}
            </button>
          </form>
        )}

        {/* Existing Moods List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[var(--tan)] uppercase">
              Current Shelf Moods ({moods.length})
            </span>
            {!isAddingNew && !editingMoodId && (
              <button
                type="button"
                onClick={startAdd}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--pepper)] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Mood</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {moods.map((m) => {
              const c = MOOD_COLOR_MAP[m.color] || MOOD_COLOR_MAP.pepper;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] gap-3 hover:border-[var(--line)]/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.preview }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[var(--palm)] uppercase">
                          {m.tag}
                        </span>
                        {m.isCustom && (
                          <span className="bg-[var(--surface)] text-[9px] font-mono text-[var(--tan)] px-1.5 py-0.2 rounded-full border border-[var(--line)]">
                            Custom
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-[var(--cream)] truncate">
                        {m.label}
                      </h4>
                      {m.context && (
                        <p className="text-[11px] text-[var(--tan)] truncate max-w-xs sm:max-w-md">
                          {m.context}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--tan)] hover:text-[var(--cream)] hover:border-[var(--line)] border border-transparent transition-all"
                      title="Edit mood"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {moods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteMood(m.id)}
                        className="p-1.5 rounded-lg bg-[var(--surface)] text-red-500 hover:bg-red-500/10 border border-transparent transition-all"
                        title="Delete mood"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Reset & Done */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={resetMoods}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--tan)] hover:text-[var(--cream)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-[var(--surface)] border border-[var(--line)] text-[var(--cream)] hover:border-[var(--pepper)] font-display font-bold text-xs px-5 py-2 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
