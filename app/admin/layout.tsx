import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-admin-theme className="min-h-screen bg-paper text-ink">
      {children}
    </div>
  );
}
