import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface RecipeCardProps {
  slug: string;
  title: string;
  image_url: string;
  cook_time_mins: number;
  cuisine: string;
  matchScore?: number; // Added later in Phase 3
}

export default function RecipeCard({ slug, title, image_url, cook_time_mins, cuisine, matchScore }: RecipeCardProps) {
  // Determine match badge color
  let badgeColor = 'bg-gray-200 text-gray-800';
  if (matchScore !== undefined) {
    if (matchScore >= 80) badgeColor = 'bg-green-100 text-green-800 border-green-200';
    else if (matchScore >= 50) badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    else badgeColor = 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <Link href={`/recipe/${slug}`} className="group flex flex-col bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full bg-muted">
        <Image 
          src={image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=400&q=80'} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {matchScore !== undefined && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold border ${badgeColor} shadow-sm backdrop-blur-sm`}>
            {matchScore}% Match
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between">
        <h3 className="font-semibold text-card-foreground text-lg leading-tight mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center justify-between text-sm text-foreground/70">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{cook_time_mins}m</span>
          </div>
          <span className="capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-medium">
            {cuisine}
          </span>
        </div>
      </div>
    </Link>
  );
}
