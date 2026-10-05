/**
 * Catálogo de formularios públicos que envían notificaciones por email.
 * Es la ÚNICA lista: el servicio central, el CMS y las acciones públicas
 * leen de aquí. Para sumar un formulario nuevo se agrega aquí, se escribe
 * su formatter (form-formatters.ts) y se llama a sendFormNotifications desde
 * su Server Action — no se crea otra función de correo.
 */

export const FORM_TYPES = ["contacto", "primera-vez", "oracion", "grupos", "generaciones"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export function isFormType(value: unknown): value is FormType {
  return typeof value === "string" && (FORM_TYPES as readonly string[]).includes(value);
}

export interface FormDefinition {
  type: FormType;
  /** Nombre en el CMS. */
  label: string;
  /** Ruta pública del formulario (se muestra en el CMS para identificarlo). */
  publicRoute: string;
  /** Encabezado del correo interno. */
  internalTitle: string;
  /** Prefijo del asunto del correo interno; el resumen (nombre) se agrega después. */
  internalSubject: string;
  /** Ruta del CMS donde se ve la solicitud — solo rutas que existen. */
  adminPath: string;
  /** Aviso opcional que el CMS muestra en la tarjeta del formulario (ej. reglas de privacidad). */
  cmsNote?: string;
  /** Texto predeterminado de la respuesta automática. */
  defaultAutoReply: { subject: string; message: string };
}

function message(body: string) {
  return ["Hola {{nombre}},", "", "Gracias por comunicarte con Inspira Church.", "", body, "", "Dios te bendiga.", "", "Inspira Church"].join("\n");
}

export const FORM_DEFINITIONS: Record<FormType, FormDefinition> = {
  contacto: {
    type: "contacto",
    label: "Contacto",
    publicRoute: "/contacto",
    internalTitle: "NUEVO CONTACTO RECIBIDO",
    internalSubject: "Nuevo contacto desde inspirachurch.co",
    adminPath: "/admin/formularios",
    defaultAutoReply: {
      subject: "Recibimos tu mensaje | Inspira Church",
      message: message(
        "Hemos recibido tu mensaje y uno de nuestros servidores se pondrá en contacto contigo lo antes posible."
      ),
    },
  },
  "primera-vez": {
    type: "primera-vez",
    label: "Primera vez",
    publicRoute: "/primera-vez",
    internalTitle: "NUEVA FICHA DE PRIMERA VEZ",
    internalSubject: "Nueva ficha de Primera vez en inspirachurch.co",
    adminPath: "/admin/formularios",
    defaultAutoReply: {
      subject: "Recibimos tus datos | Inspira Church",
      message: message(
        "Hemos recibido tus datos y uno de nuestros servidores se pondrá en contacto contigo lo antes posible."
      ),
    },
  },
  oracion: {
    type: "oracion",
    label: "Peticiones de oración",
    publicRoute: "/oracion",
    internalTitle: "NUEVA PETICIÓN DE ORACIÓN",
    internalSubject: "Nueva petición de oración en inspirachurch.co",
    adminPath: "/admin/oracion",
    cmsNote:
      "Las peticiones marcadas como privadas se notifican únicamente al correo administrativo principal. Los correos adicionales no reciben avisos de peticiones privadas.",
    defaultAutoReply: {
      subject: "Recibimos tu petición de oración | Inspira Church",
      message: [
        "Hola {{nombre}},",
        "",
        "Gracias por compartir tu petición de oración con Inspira Church.",
        "",
        "Hemos recibido tu solicitud y estaremos orando por ella.",
        "",
        "Dios te bendiga.",
        "",
        "Inspira Church",
      ].join("\n"),
    },
  },
  grupos: {
    type: "grupos",
    label: "Unirme a un grupo",
    publicRoute: "/grupos/unirme",
    internalTitle: "NUEVA SOLICITUD PARA UNIRSE A UN GRUPO",
    internalSubject: "Nueva solicitud de grupo en inspirachurch.co",
    adminPath: "/admin/formularios",
    defaultAutoReply: {
      subject: "Recibimos tu solicitud | Inspira Church",
      message: message(
        "Hemos recibido tu solicitud para unirte a un grupo y uno de nuestros servidores se pondrá en contacto contigo lo antes posible."
      ),
    },
  },
  generaciones: {
    type: "generaciones",
    label: "Inscripción de Generaciones",
    publicRoute: "/generaciones/inscripcion",
    internalTitle: "NUEVA INSCRIPCIÓN DE GENERACIONES",
    internalSubject: "Nueva inscripción de Generaciones en inspirachurch.co",
    adminPath: "/admin/generaciones/inscripciones",
    defaultAutoReply: {
      subject: "Recibimos la inscripción | Inspira Church",
      message: message(
        "Hemos recibido la inscripción y uno de nuestros servidores se pondrá en contacto contigo lo antes posible."
      ),
    },
  },
};
