import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { googleMapsLink, wazeLink } from "@/lib/maps";
import { cn } from "@/lib/utils";

interface VisitUsProps {
  eyebrow: string;
  title: string;
  siteName: string;
  address: string | null;
  lat: number;
  lng: number;
}

export function VisitUs({ eyebrow, title, siteName, address, lat, lng }: VisitUsProps) {
  return (
    <section className="border-b border-white/10" style={{ backgroundColor: ABOUT_COLORS.coral }}>
      <Container className="py-16 sm:py-24">
        <p className="inline-block border border-black/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black/70">
          {eyebrow}
        </p>
        <h2
          className={cn(
            anton.className,
            "mt-4 max-w-2xl text-balance text-4xl uppercase leading-[0.92] text-black sm:text-5xl"
          )}
        >
          {title}
        </h2>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={cn(anton.className, "text-lg uppercase text-black")}>{siteName}</p>
            {address && <p className={cn(hind.className, "mt-1 text-base text-black/70")}>{address}</p>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={googleMapsLink(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold uppercase tracking-wide text-black underline decoration-black/40 underline-offset-4 transition-colors hover:decoration-black"
            >
              Abrir en Google Maps ↗
            </a>
            <a
              href={wazeLink(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold uppercase tracking-wide text-black underline decoration-black/40 underline-offset-4 transition-colors hover:decoration-black"
            >
              Abrir en Waze ↗
            </a>
          </div>
        </div>
      </Container>

      <div className="h-[22rem] w-full border-t border-black/15 sm:h-[30rem]">
        <SinglePointMap lat={lat} lng={lng} label={siteName} sublabel={address} />
      </div>
    </section>
  );
}
