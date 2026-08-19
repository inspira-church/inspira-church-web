"use client";

import { useState } from "react";
import { FirstTimeConnectionForm } from "@/components/public/FirstTimeConnectionForm";
import { montserratAlternates } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/** Botón "Déjanos tus datos" que despliega la ficha de conexión — mismo trazo que GoldButton, color propio (#D4C78F). */
export function FirstTimeConnectionReveal({ privacyPolicyUrl }: { privacyPolicyUrl?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10 flex flex-col items-center">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-md bg-[#D4C78F] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110"
        >
          Déjanos tus datos
          <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1">
            →
          </span>
        </button>
      )}

      <div
        className={cn(
          "grid w-full transition-all duration-500 ease-in-out",
          open ? "mt-10 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="mx-auto w-full max-w-xl overflow-hidden">
          <p
            className={cn(
              montserratAlternates.className,
              "mb-8 text-balance text-center text-lg leading-snug sm:text-xl"
            )}
          >
            <span className="font-normal text-white">
              Lo que llevas en tu corazón también importa. Compártelo con nosotros y oremos
              juntos.{" "}
            </span>
            <span className="text-sm font-bold uppercase text-[#FF7F50] sm:text-base">
              ¡Dios escucha lo que hay en tu corazón!
            </span>
          </p>
          <FirstTimeConnectionForm
            privacyPolicyUrl={privacyPolicyUrl}
            onCancel={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
