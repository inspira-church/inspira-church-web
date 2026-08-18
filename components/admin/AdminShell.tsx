"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import { ADMIN_NAV, getActiveNavLabel } from "@/lib/admin-nav";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  userName: string;
  userRole: string;
  isAdmin: boolean;
  children: ReactNode;
}

export function AdminShell({ userName, userRole, isAdmin, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const sections = ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((section) => section.items.length > 0);

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  function closeMobile() {
    setMobileOpen(false);
    openButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMobile();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  const activeLabel = getActiveNavLabel(pathname);

  const navList = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-3">
      {sections.map((section) => (
        <div key={section.label || "root"}>
          {section.label && (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint/80">
              {section.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md border-l-2 px-[calc(0.75rem-2px)] py-2 text-sm font-medium transition-colors duration-150",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-transparent text-ink-soft hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="border-b border-border px-5 py-5">
      <p className="font-display text-lg font-semibold text-ink">Inspira Church</p>
      <p className="text-xs text-ink-faint">Panel administrativo</p>
    </div>
  );

  return (
    <div className="flex min-h-full">
      {/* Sidebar — escritorio */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-paper-raised md:flex">
        {brand}
        {navList}
      </aside>

      {/* Sidebar — cajón móvil (siempre montado para poder animar salida) */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobile}
        />
        <aside
          id="admin-mobile-nav"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-paper-raised shadow-xl transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-5">
            <div>
              <p className="font-display text-lg font-semibold text-ink">Inspira Church</p>
              <p className="text-xs text-ink-faint">Panel administrativo</p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMobile}
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {navList}
        </aside>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-paper-raised px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={openButtonRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-nav"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {activeLabel && (
              <p className="hidden truncate text-sm font-medium text-ink-soft md:block">
                {activeLabel}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-ink">{userName}</p>
            </div>
            <Badge variant={isAdmin ? "accent" : "neutral"} className="capitalize">
              {userRole}
            </Badge>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 bg-paper p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
