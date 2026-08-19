"use client";

import Image from "next/image";
import { useState } from "react";
import { SermonPlayIndicator } from "@/components/public/SermonPlayIndicator";
import { getYouTubeId } from "@/lib/format";

interface LazySermonVideoProps {
  url: string;
  title: string;
  thumbnailUrl: string | null;
}

/**
 * Solo para /predicas/[slug] — deliberadamente distinto de
 * components/public/YouTubeEmbed.tsx (que usa el EN VIVO de Inicio y no se
 * toca). Muestra la miniatura con un botón Play hasta que la persona hace
 * clic; recién ahí monta el iframe de YouTube, evitando cargar su JS/red en
 * cada visita a una página de prédica.
 */
export function LazySermonVideo({ url, title, thumbnailUrl }: LazySermonVideoProps) {
  const [playing, setPlaying] = useState(false);
  const id = getYouTubeId(url);

  if (!id) return null;

  const poster = thumbnailUrl ?? `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#0d0d0d]">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image src={poster} alt="" fill className="object-cover" sizes="(min-width: 1024px) 720px, 100vw" />
          <div
            className="absolute inset-0 bg-black/10 transition-colors duration-300 ease-out group-hover:bg-black/25"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <SermonPlayIndicator size="lg" />
          </div>
        </button>
      )}
    </div>
  );
}
