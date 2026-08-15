"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

interface LazyVideoProps {
  videoUrl: string;
  title: string;
}

export default function LazyVideo({ videoUrl, title }: LazyVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract YouTube ID for thumbnail
  let videoId = '';
  if (videoUrl.includes('youtube.com/watch?v=')) {
    videoId = videoUrl.split('v=')[1]?.split('&')[0];
  } else if (videoUrl.includes('youtube.com/embed/')) {
    videoId = videoUrl.split('embed/')[1]?.split('?')[0];
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
  }

  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm my-6">
      {!isLoaded ? (
        <button 
          onClick={() => setIsLoaded(true)}
          className="w-full h-full relative group cursor-pointer"
          aria-label="Play video"
        >
          <Image 
            src={thumbnailUrl} 
            alt={`Thumbnail for ${title}`} 
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </div>
        </button>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full absolute top-0 left-0"
        />
      )}
    </div>
  );
}
