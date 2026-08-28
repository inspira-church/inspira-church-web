import Link from "next/link";
import { Eyebrow, GoldButton } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Cubre las URLs que no coinciden con ninguna ruta del sitio. Autocontenida
 * (sin Header/Footer): este archivo vive en la raíz de app/ porque Next.js
 * solo usa el not-found.tsx de nivel raíz para URLs completamente
 * inexistentes — uno dentro de app/(public)/ solo cubriría los notFound()
 * lanzados desde páginas ya emparejadas (predicas/[slug], eventos/[slug],
 * etc.), no una URL que nunca existió.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-black py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <Eyebrow color={ABOUT_COLORS.coral}>Error 404</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-5 text-balance text-5xl uppercase leading-[0.92] text-white sm:text-7xl"
            )}
          >
            Página no encontrada
          </h1>
          <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-lg text-white/60")}>
            No encontramos lo que buscabas. Puede que el enlace esté roto o que la página se haya
            movido.
          </p>
          <div className="mt-9 flex justify-center">
            <GoldButton href="/" color={ABOUT_COLORS.coral}>
              Volver al inicio
            </GoldButton>
          </div>
          <p className={cn(hind.className, "mt-8 text-sm text-white/40")}>
            ¿Buscabas algo específico?{" "}
            <Link href="/contacto" className="underline hover:text-white">
              Contáctanos
            </Link>
            .
          </p>
        </div>
      </Container>
    </div>
  );
}
