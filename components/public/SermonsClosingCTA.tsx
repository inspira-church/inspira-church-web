import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface SermonsClosingCTAProps {
  /** Canal oficial de YouTube (settings.youtubeUrl, /admin/contacto) — si no está configurado, cae al catálogo interno. */
  youtubeUrl?: string;
}

/** Cierre de /predicas — por pedido explícito del usuario, el CTA lleva al canal oficial de YouTube. */
export function SermonsClosingCTA({ youtubeUrl }: SermonsClosingCTAProps) {
  const href = youtubeUrl || "/predicas";
  const isExternal = Boolean(youtubeUrl);

  return (
    <section className="py-16 text-center sm:py-24" style={{ backgroundColor: ABOUT_COLORS.teal }}>
      <Container>
        <p
          className={cn(
            anton.className,
            "mx-auto max-w-xl text-balance text-3xl uppercase leading-[1.05] text-black sm:text-5xl"
          )}
        >
          La fe también crece escuchando.
        </p>
        <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-base text-black/70")}>
          Sigue descubriendo mensajes que te ayuden a conocer más a Dios y vivir Su Palabra cada
          día.
        </p>
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110"
        >
          Explorar todos los mensajes
          <span aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-1">
            →
          </span>
        </Link>
      </Container>
    </section>
  );
}
