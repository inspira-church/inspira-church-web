export const FORM_STATUS_OPTIONS = [
  { value: "nueva", label: "Nueva" },
  { value: "contactada", label: "Contactada" },
  { value: "en_seguimiento", label: "En seguimiento" },
  { value: "finalizada", label: "Finalizada" },
];

export const CONTACT_REASON_LABEL: Record<string, string> = {
  visitar: "Quiere visitar Inspira",
  grupo: "Quiere unirse a un grupo de crecimiento",
  oracion: "Necesita oración",
  informacion: "Quiere conocer más de la iglesia",
  servir: "Quiere servir",
  evento: "Información sobre un evento",
  otro: "Otro",
};

export const PREFERRED_CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  correo: "Correo",
};
