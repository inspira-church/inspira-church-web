import Image from "next/image";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface EssenceStatementProps {
  title: string;
  text: string;
  photoUrl: string | null;
  photoAlt: string;
}

/** Sección de transición fotográfica entre Propósito y Valores — hace respirar la página. */
export function EssenceStatement({ title, text, photoUrl, photoAlt }: EssenceStatementProps) {
  return (
    <section className="relative isolate flex h-[26rem] items-center justify-center overflow-hidden border-b border-white/10 bg-black text-center sm:h-[32rem]">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {photoUrl ? (
          <Image src={photoUrl} alt={photoAlt} fill priority className="object-cover" sizes="100vw" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(120% 100% at 50% 30%, ${ABOUT_COLORS.tealLight}55 0%, #0a0a0a 75%)`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </div>

      <div className="px-8 sm:px-16">
        <p
          className={cn(
            anton.className,
            "text-balance text-3xl uppercase leading-[1.05] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)] sm:text-5xl"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            hind.className,
            "mx-auto mt-5 max-w-xl text-balance text-base text-white/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-lg"
          )}
        >
          {text}
        </p>
      </div>
    </section>
  );
}
