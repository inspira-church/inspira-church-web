import { createPublicClient as createClient } from "@/lib/supabase/public";

export interface AboutBelief {
  category: string;
  content: string;
  /** Permite preparar una categoría en el panel sin mostrarla todavía en /nosotros. */
  visible: boolean;
}

export interface AboutValue {
  title: string;
  description: string;
  /** Permite preparar un valor en el panel sin mostrarlo todavía en /nosotros. */
  visible: boolean;
}

export interface AboutContent {
  historyEyebrow: string;
  historyTitle: string;
  historyText: string;
  historyImageAlt: string;

  purposeEyebrow: string;
  purposeTitle: string;
  missionTitle: string;
  missionHeadline: string;
  missionText: string;
  visionTitle: string;
  visionHeadline: string;
  visionText: string;

  essenceTitle: string;
  essenceText: string;
  essenceImageAlt: string;

  valuesEyebrow: string;
  valuesTitle: string;
  values: AboutValue[];

  beliefsEyebrow: string;
  beliefsTitle: string;
  beliefsIntro: string;
  beliefs: AboutBelief[];

  visitEyebrow: string;
  visitTitle: string;

  ctaTitle: string;
  ctaText: string;
}

/**
 * Diez categorías del accordion de creencias más "La Iglesia" (no encajaba
 * en ninguna de las diez, pero es una afirmación doctrinal real que ya
 * existía y no debía perderse — ver CLAUDE.md, sección Nosotros). Solo
 * cuatro tienen contenido real hoy; el resto queda preparado y oculto
 * (visible: false) hasta que el equipo pastoral redacte el texto — nunca
 * se inventa doctrina para llenar un hueco.
 */
const DEFAULT_BELIEFS: AboutBelief[] = [
  {
    category: "La Biblia",
    content:
      "Creemos que la Biblia es la Palabra inspirada de Dios y nuestra guía para la fe y la vida.",
    visible: true,
  },
  {
    category: "Dios",
    content:
      "Creemos en un solo Dios, revelado en tres personas: Padre, Hijo y Espíritu Santo.",
    visible: true,
  },
  { category: "Jesús", content: "", visible: false },
  { category: "El Espíritu Santo", content: "", visible: false },
  {
    category: "Salvación",
    content: "Creemos que la salvación es por gracia, mediante la fe en Jesucristo.",
    visible: true,
  },
  { category: "Santidad", content: "", visible: false },
  { category: "Bautismo", content: "", visible: false },
  { category: "Santa Cena", content: "", visible: false },
  { category: "Matrimonio", content: "", visible: false },
  { category: "Eternidad", content: "", visible: false },
  {
    category: "La Iglesia",
    content:
      "Creemos en la iglesia local como una familia llamada a amar, servir y hacer discípulos.",
    visible: true,
  },
];

/** Copia original de la página Nosotros — se usa mientras el admin no haya guardado nada distinto. */
export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  historyEyebrow: "Nuestra historia",
  historyTitle: "Una familia antes que una institución",
  historyText:
    "Somos una familia que ama a Dios y a las personas. Un lugar donde las vidas son restauradas, las familias fortalecidas y aprendemos a vivir conscientes de Su presencia cada día.",
  historyImageAlt: "Comunidad de Inspira Church compartiendo juntos",

  purposeEyebrow: "Nuestro propósito",
  purposeTitle: "Existimos con un propósito",
  missionTitle: "Misión",
  missionHeadline: "Presentar a Jesús",
  missionText:
    "Presentar a Jesús como Señor y Salvador, sembrando Su Palabra y acompañando a cada persona para crecer, afirmarse, servir y vivir su propósito en Dios.",
  visionTitle: "Visión",
  visionHeadline: "Una iglesia movida por el Espíritu Santo",
  visionText:
    "Vemos una iglesia dirigida por el Espíritu Santo, donde las personas aman y sirven a Dios, crecen en una relación personal con Él y experimentan vidas y familias transformadas. Una iglesia que forma discípulos, levanta líderes y extiende su misión en Bogotá y más allá.",

  essenceTitle: "Amamos a Dios. Amamos a las personas.",
  essenceText: "Y queremos que cada persona pueda encontrar su lugar, crecer y vivir su propósito.",
  essenceImageAlt: "Comunidad de Inspira Church en un momento de adoración",

  valuesEyebrow: "Lo que nos mueve",
  valuesTitle: "Nuestros valores",
  values: [
    {
      title: "Cercanía",
      description: "Creemos en relaciones reales. Aquí nadie es un número.",
      visible: true,
    },
    {
      title: "Excelencia",
      description: "Hacemos las cosas con calidad, como una ofrenda a Dios.",
      visible: true,
    },
    {
      title: "Generosidad",
      description: "Damos libremente nuestro tiempo, recursos y nuestra casa.",
      visible: true,
    },
    {
      title: "Crecimiento",
      description: "Nadie se queda igual. Siempre hay un siguiente paso.",
      visible: true,
    },
  ],

  beliefsEyebrow: "Lo que creemos",
  beliefsTitle: "Nuestra fe tiene fundamento",
  beliefsIntro:
    "Nuestra fe está centrada en Jesús y fundamentada en la Palabra de Dios. Estas son las verdades que creemos y vivimos como iglesia.",
  beliefs: DEFAULT_BELIEFS,

  visitEyebrow: "Queremos conocerte",
  visitTitle: "Tu lugar también puede estar aquí",

  ctaTitle: "No tienes que hacer este camino solo.",
  ctaText: "Hay una familia esperando conocerte.",
};

/**
 * Antes del rediseño de /nosotros, `beliefs` se guardaba como `string[]`
 * plano (una creencia por línea, sin categoría). Si la fila guardada todavía
 * tiene ese formato, se migra en lectura a la forma nueva en vez de
 * descartarla — ninguna creencia real se pierde, aunque quede con una
 * categoría genérica hasta que alguien la renombre desde el panel.
 */
function normalizeBeliefs(raw: unknown): AboutBelief[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (typeof raw[0] === "string") {
    return (raw as string[]).map((content, i) => ({
      category: `Creencia ${i + 1}`,
      content,
      visible: true,
    }));
  }
  return raw as AboutBelief[];
}

/**
 * Antes de permitir agregar/quitar valores, `values` siempre tenía
 * exactamente 4 filas sin `visible` (todas implícitamente visibles). Si la
 * fila guardada tiene ese formato viejo, se completa `visible: true` en vez
 * de perder los valores reales ya escritos por el admin.
 */
function normalizeValues(raw: unknown): AboutValue[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((v: Partial<AboutValue>) => ({
    title: v.title ?? "",
    description: v.description ?? "",
    visible: v.visible ?? true,
  }));
}

/** Igual que site_settings.general, pero en su propia fila (key='about') por ser un bloque de texto grande y aparte. */
export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "about")
    .maybeSingle();

  if (!data?.value) return DEFAULT_ABOUT_CONTENT;
  const saved = data.value as Partial<AboutContent>;
  return {
    ...DEFAULT_ABOUT_CONTENT,
    ...saved,
    values: normalizeValues(saved.values) ?? DEFAULT_ABOUT_CONTENT.values,
    beliefs: normalizeBeliefs(saved.beliefs) ?? DEFAULT_ABOUT_CONTENT.beliefs,
  };
}
