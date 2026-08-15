import { supabase } from '@/lib/supabase';
import RecipeCard from '@/components/RecipeCard';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="flex flex-col p-4 pt-6 md:p-8 w-full max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">The Kitchen Book</h1>
        <p className="text-foreground/70">What can you cook today?</p>
      </header>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Failed to load recipes. Please try again later.
        </div>
      ) : !recipes || recipes.length === 0 ? (
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border text-center shadow-sm">
          <p className="text-lg mb-2">No recipes found yet.</p>
          <p className="text-sm text-foreground/60">Check back once the database is seeded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
          {recipes.map((recipe: any) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
