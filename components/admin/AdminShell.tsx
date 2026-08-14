"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import { ADMIN_NAV } from "@/lib/admin-nav";
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

  const items = ADMIN_NAV.filter((item) => !item.adminOnly || isAdmin);

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const navList = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-ink-soft hover:bg-paper hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
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

      {/* Sidebar — cajón móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-paper-raised">
            <div className="flex items-center justify-between border-b border-border px-5 py-5">
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  Inspira Church
                </p>
                <p className="text-xs text-ink-faint">Panel administrativo</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="text-ink-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navList}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-paper-raised px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="text-ink md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{userName}</p>
              <p className="text-xs capitalize text-ink-faint">{userRole}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-paper hover:text-ink"
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
