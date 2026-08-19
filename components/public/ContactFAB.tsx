"use client";

import { Mail, MoreHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ContactFABProps {
  whatsappMessage?: string;
  whatsappNumber?: string;
  contactEmail?: string;
}

const SUB_BUTTON_CLASSES =
  "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 ease-out hover:scale-105 motion-reduce:transition-none";

/**
 * Botón flotante único que se despliega en las opciones de contacto —
 * reemplaza el botón de WhatsApp fijo de siempre (WhatsAppButton.tsx sigue
 * existiendo tal cual para el enlace "inline" de /contacto). Cierra con
 * Escape o al hacer clic afuera.
 */
export function ContactFAB({ whatsappMessage, whatsappNumber, contactEmail }: ContactFABProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8"
    >
      <div
        className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            aria-label="Enviarnos un correo"
            className={cn(SUB_BUTTON_CLASSES, "bg-[#008080]")}
          >
            <Mail className="h-5 w-5" aria-hidden="true" />
          </a>
        )}
        <a
          href={whatsappLink(whatsappMessage, whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp"
          className={cn(SUB_BUTTON_CLASSES, "bg-[#25D366]")}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 fill-current">
            <path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.22.6 4.3 1.65 6.09L4 29l8.1-1.63A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.62 28 15S22.64 3 16.02 3Zm0 21.7c-1.95 0-3.77-.55-5.31-1.5l-.38-.23-4.8.97.98-4.68-.25-.4A9.63 9.63 0 0 1 6.35 15c0-5.34 4.34-9.68 9.67-9.68 5.34 0 9.68 4.34 9.68 9.68 0 5.34-4.34 9.7-9.68 9.7Zm5.32-7.26c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.14-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.39 0 1.41 1.03 2.77 1.17 2.96.14.19 2.02 3.08 4.9 4.32.68.3 1.22.47 1.63.6.68.22 1.31.19 1.8.11.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" />
          </svg>
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Cerrar opciones de contacto" : "Abrir opciones de contacto"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D2431B] text-white shadow-lg transition-transform duration-200 ease-out hover:scale-105 motion-reduce:transition-none"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MoreHorizontal className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
