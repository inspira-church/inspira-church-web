"use client";

import { useEffect, useState } from "react";
import { msUntilEventStart } from "@/lib/event-status";
import { anton } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface EventCountdownProps {
  eventDate: string;
  eventTime: string | null;
}

const TICK_MS = 30_000;

function partsFromMs(ms: number) {
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

/**
 * Se actualiza cada 30 s (no cada segundo — sin timers pesados) y
 * desaparece sola cuando el evento ya empezó, sin mostrar valores
 * negativos. `aria-hidden`: la fecha completa ya existe como texto
 * semántico en el resto de la página (§7/§50) — evita que un lector de
 * pantalla anuncie el conteo constantemente.
 */
export function EventCountdown({ eventDate, eventTime }: EventCountdownProps) {
  const [ms, setMs] = useState<number | null>(() => msUntilEventStart({ eventDate, eventTime }));

  useEffect(() => {
    const id = setInterval(() => {
      setMs(msUntilEventStart({ eventDate, eventTime }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [eventDate, eventTime]);

  if (ms === null) return null;
  const { days, hours, minutes } = partsFromMs(ms);

  return (
    <div aria-hidden="true">
      <p className="text-xs font-bold uppercase tracking-widest text-white/45">Faltan</p>
      <p className={cn(anton.className, "mt-1 text-xl uppercase tracking-wide text-white sm:text-2xl")}>
        {days} días · {String(hours).padStart(2, "0")} horas · {String(minutes).padStart(2, "0")} min
      </p>
    </div>
  );
}
