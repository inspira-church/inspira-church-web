"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CAMPAIGN_COLORS, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  type: "image" | "video";
  url: string;
  alt?: string;
}

interface HeroProps {
  /**
   * Fotos/video reales del bucket "site" (ver lib/actions/media.ts). Si no
   * se pasa nada, se usa el marcador de posición de abajo — mismo patrón de
   * "no configurado todavía" que lib/turnstile.ts y lib/youtube.ts.
   */
  slides?: HeroSlide[];
  /** Editable desde /admin/configuracion (settings.heroText1/2). `**texto**` se muestra en negrita. */
  texts?: string[];
}

/** "el **amor de Dios** restaura" -> el <strong>amor de Dios</strong> restaura */
function renderBold(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

const PLACEHOLDER_SLIDES: { color: string; kind: "Foto" | "Video" }[] = [
  { color: CAMPAIGN_COLORS[0], kind: "Foto" },
  { color: CAMPAIGN_COLORS[1], kind: "Video" },
  { color: CAMPAIGN_COLORS[2], kind: "Foto" },
  { color: CAMPAIGN_COLORS[3], kind: "Foto" },
  { color: CAMPAIGN_COLORS[4], kind: "Video" },
];

const SLIDE_INTERVAL_MS = 4200;

// El texto es autónomo: no depende del slide. Sale y luego entra (no al
// mismo tiempo), con recorrido y desvanecido lentos.
const TEXT_INTERVAL_MS = 7500;
const TEXT_EXIT_MS = 900;
const TEXT_ENTER_MS = 2000;
const TEXT_TRAVEL_PX = 28;

const DEFAULT_TEXTS = [
  "Somos una iglesia donde el **amor de Dios** restaura vidas y transforma **familias**.",
  "Vivimos para **adorar a Dios**, conscientes de que **su presencia** nos acompaña cada día.",
];

export function Hero({ slides, texts }: HeroProps) {
  const usingPlaceholder = !slides || slides.length === 0;
  const slideCount = usingPlaceholder ? PLACEHOLDER_SLIDES.length : (slides as HeroSlide[]).length;
  const heroTexts = texts && texts.length > 0 ? texts : DEFAULT_TEXTS;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (reducedMotionRef.current || paused || slideCount <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slideCount);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slideCount]);

  // Totalmente autónomo — su propio temporizador, no ligado al del slide.
  useEffect(() => {
    if (reducedMotionRef.current || heroTexts.length <= 1) return;
    const id = setInterval(() => {
      setTextIndex((i) => (i + 1) % heroTexts.length);
    }, TEXT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [heroTexts.length]);

  const goPrev = () => setActive((i) => (i - 1 + slideCount) % slideCount);
  const goNext = () => setActive((i) => (i + 1) % slideCount);

  return (
    <section
      className="group relative isolate h-[26rem] overflow-hidden border-b border-black/40 bg-black text-white sm:h-[30rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 -z-20 bg-black" aria-hidden="true">
        {usingPlaceholder
          ? PLACEHOLDER_SLIDES.map((slide, i) => (
              <div
                key={i}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1400ms]",
                  i === active ? "opacity-100" : "opacity-0"
                )}
                style={{
                  background: `radial-gradient(120% 100% at 22% 18%, ${slide.color}e6 0%, #0a0a0a 80%)`,
                }}
              >
                <span className="absolute right-4 top-4 rounded border border-white/25 bg-black/35 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/75">
                  {slide.kind === "Video" ? "▶ Video" : "Foto"}
                </span>
              </div>
            ))
          : (slides as HeroSlide[]).map((slide, i) => (
              <div
                key={slide.url}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1400ms]",
                  i === active ? "opacity-100" : "opacity-0"
                )}
              >
                {slide.type === "video" ? (
                  <video
                    className="h-full w-full object-cover"
                    src={slide.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- URL dinámica de Supabase Storage, sin dominio fijo para next/image.
                  <img
                    className="h-full w-full object-cover"
                    src={slide.url}
                    alt={slide.alt ?? ""}
                  />
                )}
              </div>
            ))}
      </div>

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.88) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8 text-center sm:px-16">
        {heroTexts.map((text, i) => {
          const isActive = i === textIndex;
          return (
            <p
              key={i}
              className={cn(
                hind.className,
                "absolute max-w-3xl text-xl font-normal leading-snug text-white ease-in-out [text-shadow:0_2px_16px_rgba(0,0,0,0.7)] sm:text-3xl lg:text-4xl",
                isActive ? "opacity-100" : "opacity-0"
              )}
              style={
                isActive
                  ? {
                      // Entrada: sube desde abajo mientras se desvanece hacia adentro.
                      transform: "translateY(0)",
                      transitionProperty: "opacity, transform",
                      transitionDuration: `${TEXT_ENTER_MS}ms`,
                      // Espera a que el anterior termine de salir, para que no
                      // se vean montados uno sobre el otro.
                      transitionDelay: `${TEXT_EXIT_MS}ms`,
                    }
                  : {
                      // Salida: solo desvanecido, sin desplazamiento — el
                      // salto a la posición de partida ocurre ya invisible.
                      transform: `translateY(${TEXT_TRAVEL_PX}px)`,
                      transitionProperty: "opacity, transform",
                      transitionDuration: `${TEXT_EXIT_MS}ms, 0ms`,
                      transitionDelay: `0ms, ${TEXT_EXIT_MS}ms`,
                    }
              }
            >
              {renderBold(text)}
            </p>
          );
        })}
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto/video anterior"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-white/70 opacity-0 transition-opacity duration-200 hover:text-white group-hover:opacity-100 sm:left-6"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Siguiente foto/video"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-white/70 opacity-0 transition-opacity duration-200 hover:text-white group-hover:opacity-100 sm:right-6"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver foto/video ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === active ? "bg-white" : "bg-white/35"
                )}
              />
            ))}
          </div>
        </>
      )}

      {usingPlaceholder && (
        <p className="absolute bottom-5 right-6 z-10 hidden max-w-xs text-right text-[11px] text-white/45 lg:block">
          Fotos y video ilustrativos — se reemplazan por contenido real de Inspira.
        </p>
      )}
    </section>
  );
}
