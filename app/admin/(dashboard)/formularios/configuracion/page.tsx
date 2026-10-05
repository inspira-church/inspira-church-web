import Link from "next/link";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DefaultRecipientForm, FormEmailConfigForm } from "@/components/admin/FormEmailConfigForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { resolveAllSettings } from "@/lib/email/form-config";
import { FORM_DEFINITIONS, FORM_TYPES } from "@/lib/email/form-definitions";
import { requireAdmin } from "@/lib/require-admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export default async function FormEmailSettingsPage() {
  // La tabla es solo-admin (RLS); aquí además se responde con un mensaje claro a un Editor.
  if (!(await requireAdmin())) {
    return (
      <div>
        <PageHeader title="Correos de los formularios" />
        <p className="mt-6 text-sm text-ink-soft">
          Solo un Administrador puede configurar los correos de los formularios.{" "}
          <Link href="/admin/formularios" className="text-accent underline">
            Volver a Formularios
          </Link>
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("form_email_settings").select("form_key, config");
  const migrationPending = isMissingTableError(error);
  const settings = resolveAllSettings(migrationPending || error ? [] : data);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Formularios", href: "/admin/formularios" }, { label: "Correos" }]}
        className="mb-3"
      />
      <PageHeader
        title="Correos de los formularios"
        description="Quién recibe el aviso de cada formulario y qué agradecimiento recibe el visitante. Los cambios se aplican a la siguiente solicitud, sin esperar un despliegue."
      />

      {migrationPending && (
        <p role="alert" className="mt-6 rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          La configuración de correos todavía no está habilitada en la base de datos (falta aplicar la migración 028).
          Mientras tanto los formularios siguen funcionando con los valores predeterminados.
        </p>
      )}
      {error && !migrationPending && (
        <p role="alert" className="mt-6 rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          No se pudo leer la configuración guardada. Lo que ves son los valores predeterminados; no guardes cambios
          hasta recargar la página.
        </p>
      )}

      {!migrationPending && (
        <div className="mt-8 max-w-2xl space-y-8">
          <DefaultRecipientForm
            defaultRecipient={settings.global.defaultRecipient}
            envFallbackConfigured={Boolean(process.env.EMAIL_NOTIFICATION_TO)}
          />

          {FORM_TYPES.map((type) => (
            <FormEmailConfigForm
              key={type}
              formKey={type}
              label={FORM_DEFINITIONS[type].label}
              publicRoute={FORM_DEFINITIONS[type].publicRoute}
              anchor={FORM_DEFINITIONS[type].anchor}
              inboxPath={FORM_DEFINITIONS[type].adminPath}
              note={FORM_DEFINITIONS[type].cmsNote}
              config={settings.forms[type]}
              defaultRecipient={settings.global.defaultRecipient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
