"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle, Share2, Sparkles, MapPin, Plus, Send, X, Loader2 } from "lucide-react";

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Load real posts from Supabase
  useEffect(() => {
    async function loadCommunity() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            recipes (
              id,
              title,
              slug
            ),
            comments (
              id,
              body,
              created_at
            )
          `)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to load community posts from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, []);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const isLiked = !!prev[postId];
      return { ...prev, [postId]: !isLiked };
    });
  };

  const activePost = posts.find(p => p.id === activeCommentPostId);

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim() || !activeCommentPostId) return;

    setSubmittingComment(true);
    try {
      const { data: newComment, error } = await supabase
        .from("comments")
        .insert({
          post_id: activeCommentPostId,
          body: newCommentText.trim(),
          is_hidden: false
        })
        .select("id, body, created_at")
        .single();

      if (!error && newComment) {
        setPosts(current =>
          current.map(p =>
            p.id === activeCommentPostId
              ? {
                  ...p,
                  comments: [...(p.comments || []), newComment]
                }
              : p
          )
        );
        setNewCommentText("");
      }
    } catch (err) {
      console.error("Failed to add comment to Supabase:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const addQuickEmoji = (emoji: string) => {
    setNewCommentText(prev => prev + " " + emoji);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kitchen Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-serif">
            Cooked Dish Feed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real dishes made by home cooks across Nigeria and beyond.
          </p>
        </div>

        <Link
          href="/post"
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Post Dish</span>
        </Link>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Loading community dishes from database...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card p-10 rounded-3xl border border-border text-center text-muted-foreground space-y-3 shadow-xs">
          <p className="text-sm font-semibold text-foreground">No dishes shared yet</p>
          <p className="text-xs">Be the first to cook a recipe and show the community!</p>
          <Link
            href="/post"
            className="inline-block bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs"
          >
            Share Your First Dish
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            const commentsCount = post.comments ? post.comments.length : 0;
            const recipe = post.recipes;

            return (
              <div
                key={post.id}
                className="bg-card rounded-3xl overflow-hidden border border-border shadow-2xs food-card-hover transition-all"
              >
                {/* Post Header: Author & Location */}
                <div className="p-4 flex items-center justify-between border-b border-border-light">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sage-light text-primary flex items-center justify-center text-sm font-bold border border-sage-border/50">
                      👩🏾‍🍳
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-foreground leading-tight">
                        Home Chef
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>Lagos, Nigeria</span>
                      </p>
                    </div>
                  </div>

                  {recipe && (
                    <Link
                      href={`/recipe/${recipe.slug}`}
                      className="text-xs font-bold text-primary bg-sage-light border border-sage-border/40 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                      View Recipe
                    </Link>
                  )}
                </div>

                {/* Photo */}
                <div className="relative h-72 sm:h-96 w-full bg-card-warm">
                  <Image
                    src={post.image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"}
                    alt={recipe?.title || "Community dish"}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Action Bar */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Like button */}
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground hover:text-error transition-colors"
                      >
                        <Heart
                          className={`w-4.5 h-4.5 ${isLiked ? "fill-error text-error scale-110" : "text-muted-foreground"} transition-transform`}
                        />
                        <span>{isLiked ? 1 : 0}</span>
                      </button>

                      {/* Comment button */}
                      <button
                        onClick={() => setActiveCommentPostId(post.id)}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-4.5 h-4.5 text-muted-foreground" />
                        <span>{commentsCount} comments</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const text = `Check out this dish cooked on The Kitchen Book: ${recipe?.title || post.caption}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                      {post.caption}
                    </p>
                  )}

                  {/* Attached Recipe Pill */}
                  {recipe && (
                    <div className="pt-2 border-t border-border-light flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Cooked Recipe:</span>
                      <Link
                        href={`/recipe/${recipe.slug}`}
                        className="font-bold text-primary hover:text-accent transition-colors"
                      >
                        {recipe.title} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMMENTS DRAWER / MODAL */}
      {activeCommentPostId && activePost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border-light flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-foreground">
                Comments ({activePost.comments ? activePost.comments.length : 0})
              </h3>
              <button
                onClick={() => setActiveCommentPostId(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {(!activePost.comments || activePost.comments.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No comments yet. Write the first comment!
                </p>
              ) : (
                activePost.comments.map((comment: any, i: number) => (
                  <div key={comment.id || i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-7 h-7 rounded-full bg-sage-light text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 border border-sage-border/50">
                      👨🏾‍🍳
                    </div>
                    <div className="bg-card-warm p-3 rounded-2xl flex-1 border border-border">
                      <p className="text-foreground/90">{comment.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Emoji Reaction Bar */}
            <div className="px-4 py-2 bg-card-warm border-t border-border-light flex items-center justify-around text-lg">
              {["😍", "🔥", "😋", "👏", "❤️", "👍", "🤤"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addQuickEmoji(emoji)}
                  className="hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-border bg-card flex items-center gap-2">
              <input
                type="text"
                className="flex-1 py-2.5 px-4 bg-card-warm border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Write a live comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
