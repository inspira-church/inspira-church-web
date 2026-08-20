import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/** Transición explicativa entre el Hero y la búsqueda — qué es un grupo de crecimiento, para quien no lo sabe. */
export function GroupsIntro() {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: ABOUT_COLORS.cream }}>
      <div className="mx-auto w-full max-w-2xl px-6 text-center sm:px-8">
        <p className="inline-block border border-black/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black/70">
          Más que una reunión
        </p>
        <h2
          className={cn(
            anton.className,
            "mt-4 text-balance text-3xl uppercase leading-[0.95] text-black sm:text-4xl"
          )}
        >
          Crecemos mejor cuando lo hacemos juntos.
        </h2>
        <p className={cn(hind.className, "mx-auto mt-5 max-w-xl text-base leading-relaxed text-black/70")}>
          Los grupos de crecimiento son espacios donde compartimos, aprendemos de la
          Palabra, oramos y construimos relaciones reales.
        </p>
      </div>
    </section>
  );
}
