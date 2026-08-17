import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./RecipeDetailClient";

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data: recipe } = await supabase
    .from("recipes")
    .select("title, description, image_url")
    .eq("slug", slug)
    .single();

  if (!recipe) return { title: "Recipe Not Found — The Kitchen Book" };

  return {
    title: `${recipe.title} — The Kitchen Book`,
    description: recipe.description || `Cook ${recipe.title} with ingredients you have at home.`,
    openGraph: {
      title: `${recipe.title} — The Kitchen Book`,
      description: recipe.description || `Cook ${recipe.title} with ingredients you have at home.`,
      images: [recipe.image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d"],
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_ingredients (
        qty,
        unit,
        is_core,
        notes,
        ingredients (
          id,
          name,
          category
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !recipe) {
    notFound();
  }

  return <RecipeDetailClient recipe={recipe} />;
}
