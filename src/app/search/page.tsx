"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RecipeCard from '@/components/RecipeCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchRecipes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_published', true)
        .ilike('title', `%${query}%`)
        .order('title', { ascending: true })
        .limit(20);
      
      setResults(data || []);
      setLoading(false);
    };

    const debounceId = setTimeout(searchRecipes, 300);
    return () => clearTimeout(debounceId);
  }, [query]);

  return (
    <div className="flex flex-col p-4 pt-6 md:p-8 w-full max-w-4xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Search Recipes</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-foreground/40" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-lg transition-shadow"
            placeholder="Search by recipe name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>
      </header>

      {query.length >= 2 && !loading && results.length === 0 ? (
        <div className="text-center py-12 text-foreground/60">
          <p className="text-lg">No recipes found for "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
          {results.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
      
      {query.length < 2 && (
        <div className="text-center py-20 text-foreground/40">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}
