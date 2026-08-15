import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, Banknote, ShoppingCart, CheckCircle2 } from 'lucide-react';
import LazyVideo from '@/components/LazyVideo';

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description, image_url')
    .eq('slug', slug)
    .single();

  if (!recipe) return { title: 'Recipe Not Found' };

  return {
    title: `${recipe.title} - The Kitchen Book`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [recipe.image_url],
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const { data: recipe, error } = await supabase
    .from('recipes')
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
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    notFound();
  }

  // Phase 2: Mocking the Have/Missing split. (Will be driven by DB engine in Phase 3)
  // For now, assume we have staples and are missing the rest.
  const allIngredients = recipe.recipe_ingredients || [];
  const haveIngredients = allIngredients.slice(0, Math.max(1, Math.floor(allIngredients.length * 0.3)));
  const missingIngredients = allIngredients.slice(Math.max(1, Math.floor(allIngredients.length * 0.3)));

  return (
    <div className="flex flex-col w-full bg-background pb-20 md:pb-8">
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-96 bg-muted">
        <Image 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'} 
          alt={recipe.title} 
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-8">
          <span className="capitalize bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold w-max mb-3 shadow-sm">
            {recipe.cuisine}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
            {recipe.title}
          </h1>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Meta Row */}
        <div className="flex flex-wrap gap-4 md:gap-8 py-4 border-b border-border text-foreground/80 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium">{recipe.cook_time_mins} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium">{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {Array(recipe.cost_level).fill('$').join('')}
            </span>
          </div>
        </div>

        {recipe.description && (
          <p className="text-lg text-foreground/90 mb-8 leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* Video Embed */}
        {recipe.video_url && (
          <LazyVideo videoUrl={recipe.video_url} title={recipe.title} />
        )}

        {/* Ingredients Split */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 text-card-foreground">Ingredients</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* You Have */}
            <div>
              <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" />
                You have ({haveIngredients.length})
              </h3>
              <ul className="space-y-3">
                {haveIngredients.map((item: any) => (
                  <li key={item.ingredients.id} className="flex justify-between items-center text-foreground/80 border-b border-border/50 pb-2">
                    <span className="capitalize">{item.ingredients.name}</span>
                    <span className="text-sm font-medium">{item.qty} {item.unit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* You're Missing */}
            <div>
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5" />
                You're missing ({missingIngredients.length})
              </h3>
              <ul className="space-y-3 mb-6">
                {missingIngredients.map((item: any) => (
                  <li key={item.ingredients.id} className="flex justify-between items-center text-foreground/80 border-b border-border/50 pb-2">
                    <span className="capitalize">{item.ingredients.name}</span>
                    <span className="text-sm font-medium">{item.qty} {item.unit}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Buy missing ingredients
              </button>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Instructions</h2>
          <div className="space-y-6">
            {recipe.steps.map((step: string, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="pt-1 text-foreground/90 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
