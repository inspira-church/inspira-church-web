import { whatsappLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  message?: string;
  number?: string;
  /** "floating" flota fija sobre el contenido; "inline" se usa dentro de otro layout (p. ej. el footer); "text" es un CTA con label, para cuando un ícono solo no es suficientemente claro (ej. Contacto). */
  variant?: "floating" | "inline" | "text";
  /** Solo para variant="text" — label del CTA. */
  children?: React.ReactNode;
  className?: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("fill-current", className)}>
      <path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.22.6 4.3 1.65 6.09L4 29l8.1-1.63A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.62 28 15S22.64 3 16.02 3Zm0 21.7c-1.95 0-3.77-.55-5.31-1.5l-.38-.23-4.8.97.98-4.68-.25-.4A9.63 9.63 0 0 1 6.35 15c0-5.34 4.34-9.68 9.67-9.68 5.34 0 9.68 4.34 9.68 9.68 0 5.34-4.34 9.7-9.68 9.7Zm5.32-7.26c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.14-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.39 0 1.41 1.03 2.77 1.17 2.96.14.19 2.02 3.08 4.9 4.32.68.3 1.22.47 1.63.6.68.22 1.31.19 1.8.11.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}

export function WhatsAppButton({
  message,
  number,
  variant = "floating",
  children,
  className,
}: WhatsAppButtonProps) {
  if (variant === "text") {
    return (
      <a
        href={whatsappLink(message, number)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group inline-flex items-center gap-2 rounded-md bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110",
          className
        )}
      >
        <WhatsAppIcon className="h-5 w-5 shrink-0" />
        {children}
        <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true">
          →
        </span>
      </a>
    );
  }

  return (
    <a
      href={whatsappLink(message, number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-150 hover:scale-105",
        variant === "floating" &&
          "fixed bottom-6 right-6 z-40 h-14 w-14 sm:bottom-8 sm:right-8",
        variant === "inline" && "h-11 w-11",
        className
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
