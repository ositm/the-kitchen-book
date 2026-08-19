"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Camera, Image as ImageIcon, Sparkles, MapPin, Share2, Check, MessageCircle, Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const SAMPLE_POST_PHOTOS = [
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"
];

export default function PostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [selectedImage, setSelectedImage] = useState(SAMPLE_POST_PHOTOS[0]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [location, setLocation] = useState("Lagos State, Nigeria");
  const [loading, setLoading] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  // Load recipes from Supabase to attach to the post
  useEffect(() => {
    async function loadRecipes() {
      const { data } = await supabase.from("recipes").select("id, title, slug").limit(20);
      if (data && data.length > 0) {
        setRecipes(data);
        setSelectedRecipeId(data[0].id);
      }
    }
    loadRecipes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalImage = customImageUrl.trim() || selectedImage;

      const { error } = await supabase.from("posts").insert({
        image_url: finalImage,
        caption: caption.trim(),
        recipe_id: selectedRecipeId || null,
        is_hidden: false
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsPosted(true);
    } catch (err: any) {
      console.error("Failed to create post in Supabase:", err);
      alert(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRecipeObj = recipes.find(r => r.id === selectedRecipeId);

  const handleShareWhatsApp = () => {
    const dishName = selectedRecipeObj?.title || "a delicious meal";
    const text = `🍳 *I just cooked ${dishName} with The Kitchen Book!*\n\n"${caption || "Look at this delicious meal!"}"\n📍 ${location}\n\nCheck it out on The Kitchen Book!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-6 pb-28 max-w-xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--pepper)] uppercase tracking-wider mb-1 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cookbook Community</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cream)] tracking-tight font-display">
          Share What You Cooked 🍲
        </h1>
        <p className="text-xs sm:text-sm text-[var(--tan)] mt-0.5 font-body">
          Inspire other home cooks across Nigeria with your culinary creation.
        </p>
      </div>

      {!isPosted ? (
        <form onSubmit={handleSubmit} className="space-y-5 bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm">
          {/* Photo Preview & Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--cream)] uppercase tracking-wider block font-mono">
              Dish Photo
            </label>
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-[var(--surface-warm)] border border-[var(--line)]">
              <Image
                src={customImageUrl.trim() || selectedImage}
                alt="Dish preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 font-display">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo Below</span>
                </span>
              </div>
            </div>

            {/* Quick Photo Switcher */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto hide-scrollbar overscroll-x-contain touch-pan-x -mx-2 px-2">
              {SAMPLE_POST_PHOTOS.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedImage(photo);
                    setCustomImageUrl("");
                  }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === photo && !customImageUrl ? "border-[var(--pepper)] scale-105 shadow-xs" : "border-transparent opacity-70"
                  }`}
                >
                  <Image src={photo} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-xs font-medium text-[var(--cream)] focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] placeholder:text-[var(--tan)] font-mono"
            />
          </div>

          {/* Attached Recipe Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--cream)] uppercase tracking-wider block font-mono">
              Attach Recipe
            </label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--pepper)]"
            >
              <option value="">-- None / Custom Dish --</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
          </div>

          {/* Caption Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--cream)] uppercase tracking-wider block font-mono">
              Caption
            </label>
            <textarea
              rows={3}
              required
              className="w-full p-4 bg-[var(--surface-warm)] border border-[var(--line)] rounded-2xl text-[var(--cream)] placeholder:text-[var(--tan)] text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] resize-none font-body"
              placeholder="Tell everyone how it tasted, what tweaks you made, or who you cooked for..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {/* Location Tag */}
          <div className="flex items-center gap-2 text-xs text-[var(--tan)] bg-[var(--surface-warm)] p-3 rounded-xl border border-[var(--line)] font-mono">
            <MapPin className="w-4 h-4 text-[var(--pepper)]" />
            <span>Posting from: <strong>{location}</strong></span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--pepper)] hover:opacity-90 active:scale-98 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 font-display"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting to Live Community...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Post to Community Feed</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Success Screen */
        <div className="bg-[var(--surface)] rounded-3xl p-8 border border-[var(--line)] text-center shadow-xs space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[var(--pepper)]/15 text-[var(--pepper)] mx-auto flex items-center justify-center shadow-2xs border border-[var(--pepper)]/30">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[var(--cream)] font-display">
              Dish Shared to Community! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-[var(--tan)] font-body">
              Your creation is now live on the community cookbook feed.
            </p>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-2xl shadow-xs transition-all text-sm font-display"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Share Post to WhatsApp Status</span>
          </button>

          <div className="flex gap-3">
            <Link
              href="/community"
              className="flex-1 bg-[var(--pepper)] text-white font-bold py-3 rounded-xl text-xs hover:opacity-90 transition-opacity text-center font-display"
            >
              View in Feed
            </Link>
            <button
              onClick={() => {
                setIsPosted(false);
                setCaption("");
              }}
              className="flex-1 bg-[var(--surface-warm)] hover:bg-[var(--surface)] text-[var(--cream)] font-semibold py-3 rounded-xl text-xs transition-colors border border-[var(--line)] font-mono"
            >
              Share Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
