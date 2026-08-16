import { createPublicClient as createClient } from "@/lib/supabase/public";

export interface AboutContent {
  historyEyebrow: string;
  historyTitle: string;
  historyText: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesEyebrow: string;
  valuesTitle: string;
  values: { title: string; description: string }[];
  beliefsEyebrow: string;
  beliefsTitle: string;
  beliefs: string[];
}

/** Copia original de la página Nosotros — se usa mientras el admin no haya guardado nada distinto. */
export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  historyEyebrow: "Nuestra historia",
  historyTitle: "Una familia antes que una institución",
  historyText:
    "Inspira Church comenzó como una reunión de pocas familias en una sala, con el deseo simple de acompañarse en la fe. Con los años crecimos, pero no cambiamos lo esencial: seguimos siendo un lugar donde te conocen por tu nombre, no por tu asistencia.",
  missionTitle: "Misión",
  missionText: "Ayudar a las personas a conocer a Jesús, crecer en comunidad y servir con su vida.",
  visionTitle: "Visión",
  visionText:
    "Ser una iglesia que inspira a cada generación a vivir su fe de forma real, cercana y transformadora.",
  valuesEyebrow: "Lo que nos mueve",
  valuesTitle: "Nuestros valores",
  values: [
    { title: "Cercanía", description: "Creemos en relaciones reales, no en multitudes anónimas." },
    {
      title: "Excelencia",
      description: "Hacemos las cosas con calidad, como ofrenda y no como obligación.",
    },
    { title: "Generosidad", description: "Damos con libertad — el tiempo, los recursos y la casa." },
    { title: "Crecimiento", description: "Nadie se queda igual: siempre hay un siguiente paso." },
  ],
  beliefsEyebrow: "Lo que creemos",
  beliefsTitle: "Nuestras creencias",
  beliefs: [
    "Creemos en un solo Dios, revelado en tres personas: Padre, Hijo y Espíritu Santo.",
    "Creemos que la Biblia es la Palabra inspirada de Dios y nuestra guía para la fe y la vida.",
    "Creemos que la salvación es por gracia, mediante la fe en Jesucristo.",
    "Creemos en la iglesia local como una familia llamada a amar, servir y hacer discípulos.",
  ],
};

/** Igual que site_settings.general, pero en su propia fila (key='about') por ser un bloque de texto grande y aparte. */
export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "about")
    .maybeSingle();

  if (!data?.value) return DEFAULT_ABOUT_CONTENT;
  return { ...DEFAULT_ABOUT_CONTENT, ...(data.value as Partial<AboutContent>) };
}
