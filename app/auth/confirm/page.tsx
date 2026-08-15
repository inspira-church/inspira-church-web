"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Destino de los enlaces de invitación de staff. A diferencia de la
 * recuperación de contraseña (PKCE, ver app/auth/callback), inviteUserByEmail
 * no soporta PKCE: GoTrue entrega la sesión en el fragmento de la URL
 * (#access_token=...), que nunca llega al servidor — hay que leerlo aquí,
 * en el cliente, y fijar la sesión con setSession() antes de continuar.
 */
function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      router.replace("/admin/login?error=auth_callback");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        router.replace(error ? "/admin/login?error=auth_callback" : next);
      });
  }, [next, router]);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper px-6 py-16">
      <p className="text-sm text-ink-soft">Verificando tu enlace…</p>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmInner />
    </Suspense>
  );
}
