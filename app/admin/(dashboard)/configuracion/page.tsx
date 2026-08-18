import { redirect } from "next/navigation";

/**
 * "Configuración" se repartió a las páginas que administran cada cosa:
 * /admin/inicio, /admin/nosotros, /admin/primera-vez, /admin/contacto.
 * Se mantiene esta redirección por si alguien tiene el link guardado.
 */
export default function SettingsPage() {
  redirect("/admin/contacto");
}
