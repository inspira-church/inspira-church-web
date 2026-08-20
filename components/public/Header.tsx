"use client";

import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/constants";
import { ABOUT_COLORS, anton } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/** Coral cálido de la identidad de cartel (mismo tono que Inicio y el footer). */
const GOLD_CLASSES =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-white/10 transition-all duration-300 ease-out",
        scrolled
          ? "bg-black/90 shadow-[0_2px_24px_rgba(0,0,0,0.35)] backdrop-blur-md"
          : "bg-black/70 backdrop-blur-sm"
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-out",
          scrolled ? "h-16 sm:h-20" : "h-20 sm:h-24"
        )}
      >
        <Link
          href="/"
          className={cn("flex items-center gap-2 rounded-sm", GOLD_CLASSES)}
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt=""
            width={96}
            height={96}
            className={cn(
              "object-contain transition-all duration-300 ease-out",
              scrolled ? "h-12 w-12 sm:h-16 sm:w-16" : "h-16 w-16 sm:h-20 sm:w-20"
            )}
            priority
          />
          <span
            className={cn(anton.className, "text-lg sm:text-xl")}
            style={{ color: ABOUT_COLORS.tealLight }}
          >
            Inspira Church
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative rounded-sm py-2 text-sm font-semibold transition-colors duration-200",
                  active ? "text-[#FF7F50]" : "text-white/70 hover:text-[#FF7F50]",
                  GOLD_CLASSES
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-[#FF7F50] transition-transform duration-300 ease-out group-hover:scale-x-100",
                    active && "scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button
            as={Link}
            href="/generaciones"
            size="sm"
            className={cn(
              "gap-1.5 text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110",
              GOLD_CLASSES
            )}
            style={{ backgroundColor: ABOUT_COLORS.tealLight }}
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Generaciones
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md text-white md:hidden",
            GOLD_CLASSES
          )}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </Container>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Menú principal"
          className="border-t border-white/10 bg-black/95 backdrop-blur-md md:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-2 py-2.5 text-base font-semibold transition-colors hover:bg-white/5",
                    active ? "text-[#FF7F50]" : "text-white/80 hover:text-[#FF7F50]",
                    GOLD_CLASSES
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button
              as={Link}
              href="/generaciones"
              className={cn(
                "mt-2 justify-center gap-1.5 text-white transition-all duration-200 ease-out hover:brightness-110",
                GOLD_CLASSES
              )}
              style={{ backgroundColor: ABOUT_COLORS.tealLight }}
              onClick={() => setOpen(false)}
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Generaciones
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}
