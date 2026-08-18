"use server";

import { redirect } from "next/navigation";
import { logAuthEvent } from "@/lib/audit";
import { firstFieldErrors } from "@/lib/form-errors";
import { getSiteUrl } from "@/lib/get-site-url";
import { createClient } from "@/lib/supabase/server";
import {
  requestPasswordResetSchema,
  signInSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

const SUPABASE_NOT_CONFIGURED_ERROR =
  "Supabase no está conectado todavía. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "Correo o contraseña incorrectos."
        : "No se pudo iniciar sesión. Intenta de nuevo.";
    await logAuthEvent({
      action: "login_failed",
      userId: null,
      description: `Intento de inicio de sesión fallido (${parsed.data.email}).`,
    });
    return { error: message };
  }

  await logAuthEvent({
    action: "login",
    userId: data.user.id,
    description: "Inicio de sesión exitoso.",
  });

  const next = String(formData.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await logAuthEvent({ action: "logout", userId: user.id, description: "Cierre de sesión." });
    }
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/admin/actualizar-password`,
  });

  // No confirmamos ni negamos si el correo existe — evita filtrar qué
  // cuentas de staff están registradas.
  return { success: true };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "No se pudo actualizar la contraseña. El enlace pudo haber expirado." };
  }

  redirect("/admin");
}
