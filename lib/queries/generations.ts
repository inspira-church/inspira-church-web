import { createPublicClient as createClient } from "@/lib/supabase/public";

export interface GenerationsAreaGroup {
  label: string;
  age: string;
  when: string;
  practice: string;
}

export interface GenerationsArea {
  /** Estable una vez creada — alimenta el módulo de foto `generaciones-area-{id}`. Nunca se recalcula al editar el nombre. */
  id: string;
  name: string;
  tags: string;
  purpose: string;
  groups: GenerationsAreaGroup[];
}

export interface GenerationsJourneyStep {
  title: string;
  when: string;
  text: string;
}

export interface GenerationsRhythmWord {
  word: string;
  text: string;
}

export interface GenerationsFaqItem {
  q: string;
  a: string;
}

export interface GenerationsContent {
  heroEyebrow: string;
  heroTitle: string;
  heroTaglineWhite: string;
  heroTaglineCoral: string;
  heroVerseText: string;
  heroVerseRef: string;

  visionTitleWhite1: string;
  visionTitleCoral1: string;
  visionTitleWhite2: string;
  visionTitleCoral2: string;
  visionText: string;
  visionClosing: string;

  legacyTitleWhite: string;
  legacyTitleCoral: string;

  areasTitle: string;
  areasIntro: string;
  areas: GenerationsArea[];

  journeyTitle: string;
  journey: GenerationsJourneyStep[];

  ratioLeftPercent: string;
  ratioLeftLabel: string;
  ratioLeftText: string;
  ratioRightPercent: string;
  ratioRightLabel: string;
  ratioRightText: string;
  ratioClosingFaded: string;
  ratioClosingWhite: string;

  altarTitle: string;
  altarText: string;
  altarTagline: string;

  familiesTitle: string;
  familiesText: string;
  parentsGuideUrl: string;

  nextDateEyebrow: string;
  nextDate: string | null;
  nextDateNote: string;

  rhythm: GenerationsRhythmWord[];

  safetyEyebrow: string;
  safetyTitle: string;
  safetyPrinciples: string[];
  careGuidelinesUrl: string;

  faqTitle: string;
  faq: GenerationsFaqItem[];

  ctaTitle: string;
  ctaTagline: string;
  ctaClosingWhite: string;
  ctaClosingHighlight: string;
}

/** Copia literal de las 9 áreas hoy hardcodeadas en GenerationsAreas.tsx — nada inventado, "Por definir" donde el dato real todavía no existe. */
const DEFAULT_AREAS: GenerationsArea[] = [
  {
    id: "alabanza",
    name: "Alabanza",
    tags: "Adoración · Disciplina · Sensibilidad",
    purpose: "Adorar con excelencia y guiar a la congregación a encontrarse con la presencia de Dios.",
    groups: [
      { label: "Voces", age: "Por definir", when: "Sábado · 9:00–11:00 a. m.", practice: "45 min al día" },
      { label: "Instrumentos", age: "8 años (sugerido)", when: "Sábado · 9:00–11:00 a. m.", practice: "Aprox. 1 hora al día" },
    ],
  },
  {
    id: "medios",
    name: "Medios",
    tags: "Creatividad · Técnica · Concentración",
    purpose: "Contar la historia de lo que Dios hace, con excelencia técnica y sensibilidad creativa.",
    groups: [{ label: "", age: "10 años (sugerido)", when: "Preparación el sábado previo", practice: "" }],
  },
  {
    id: "teatro",
    name: "Teatro",
    tags: "Expresión · Creatividad · Confianza",
    purpose: "Enseñar verdades de Dios a través de la expresión artística y corporal.",
    groups: [{ label: "", age: "4 años", when: "Primer y tercer sábado · 9:00–11:00 a. m.", practice: "" }],
  },
  {
    id: "real-love",
    name: "Real Love",
    tags: "Hospitalidad · Empatía · Servicio",
    purpose: "Ser el primer rostro que recibe a cada familia que llega, con calidez y atención genuina.",
    groups: [{ label: "", age: "6 años", when: "Preparación breve antes del servicio", practice: "" }],
  },
  {
    id: "kids",
    name: "Kids",
    tags: "Paciencia · Enseñanza · Acompañamiento",
    purpose: "Acompañar a los más pequeños con paciencia, enseñando la Palabra de forma que puedan entenderla.",
    groups: [{ label: "", age: "10 años (sugerido)", when: "Preparación el sábado previo", practice: "" }],
  },
  {
    id: "logistica",
    name: "Logística",
    tags: "Orden · Atención · Equipo",
    purpose: "Cuidar los detalles que hacen que todo funcione: orden, atención y trabajo en equipo.",
    groups: [{ label: "", age: "8 años", when: "Día del servicio · llegada 9:00 a. m.", practice: "" }],
  },
  {
    id: "cafeteria",
    name: "Cafetería",
    tags: "Servicio · Cuidado",
    purpose: "Servir con calidez algo tan sencillo como un café, y hacer sentir a alguien bienvenido.",
    groups: [{ label: "", age: "8 años", when: "Día del servicio · llegada 9:00 a. m.", practice: "" }],
  },
  {
    id: "anuncios",
    name: "Anuncios",
    tags: "Comunicación · Confianza",
    purpose: "Comunicar con claridad lo que la iglesia necesita saber, con seguridad y buena dicción.",
    groups: [{ label: "", age: "8 años", when: "Día del servicio + ensayo previo", practice: "" }],
  },
  {
    id: "diezmos",
    name: "Diezmos",
    tags: "Mayordomía · Honra",
    purpose: "Aprender mayordomía sirviendo con honestidad en una de las áreas de mayor confianza.",
    groups: [{ label: "", age: "8 años", when: "Día del servicio · llegada 9:00 a. m.", practice: "" }],
  },
];

const DEFAULT_JOURNEY: GenerationsJourneyStep[] = [
  { title: "Explora", when: "Primer semestre", text: "Los niños y jóvenes conocen las diferentes áreas y participan en ellas." },
  { title: "Descubre", when: "", text: "Identifican afinidades, dones, habilidades y formas de servir." },
  { title: "Encuentra tu lugar", when: "", text: "La decisión se acompaña entre el niño o joven, su familia y los líderes." },
  { title: "Crece", when: "Segundo semestre", text: "Se conforman equipos base donde cada quien profundiza en su área principal." },
];

const DEFAULT_RHYTHM: GenerationsRhythmWord[] = [
  { word: "Prepárate", text: "Conoce con anticipación lo que necesitas para servir." },
  { word: "Practica", text: "La excelencia también se construye durante la semana." },
  { word: "Sirve", text: "Cada área es una oportunidad de honrar a Dios y cuidar a otros." },
  { word: "Crece", text: "Cada experiencia forma carácter, disciplina, fe y propósito." },
];

const DEFAULT_SAFETY_PRINCIPLES: string[] = [
  "Ningún niño queda a solas con un solo adulto.",
  "Siempre existe supervisión responsable en cada actividad.",
  "Los jóvenes que sirven en Kids nunca quedan solos con un grupo de niños.",
  "El contacto digital con menores se realiza siempre a través de sus padres o acudientes.",
  "Cualquier inquietud puede comunicarse de forma confidencial a los pastores.",
  "El bienestar del menor es, ante todo, la prioridad.",
];

const DEFAULT_FAQ: GenerationsFaqItem[] = [
  {
    q: "¿Y si mi hijo nunca ha servido o no tiene experiencia?",
    a: "No hay ningún problema — todos empiezan por algún lado. Durante el primer semestre cada niño o joven explora distintas áreas acompañado por los líderes, sin necesitar experiencia previa.",
  },
  {
    q: "¿Puede cambiar de área?",
    a: "Sí. La etapa de exploración existe justamente para eso: descubrir dónde encajan mejor sus dones antes de conformar los equipos base del segundo semestre.",
  },
  {
    q: "¿Qué pasa si tenemos un viaje o no podemos asistir?",
    a: "Entendemos que cada familia tiene su propio ritmo. Avisa a los líderes del área y retomen el proceso cuando puedan volver, sin ninguna presión.",
  },
  {
    q: "¿Puede participar si es tímido?",
    a: "Por supuesto. Hay áreas que se acomodan bien a personalidades más reservadas, y todo el proceso respeta el tiempo de cada niño o joven.",
  },
  {
    q: "¿Tiene algún costo?",
    a: "No. Participar en Generaciones no tiene ningún costo para la familia.",
  },
  {
    q: "¿Qué pasa si tiene una condición especial?",
    a: "Cuéntanos con anticipación. Junto a la familia buscamos la forma en que cada niño o joven pueda servir de manera segura y significativa.",
  },
];

/** Copia literal de los 13 componentes hoy hardcodeados — la página no cambia hasta que un admin guarde algo distinto. */
export const DEFAULT_GENERATIONS_CONTENT: GenerationsContent = {
  heroEyebrow: "Inspira Church / Generaciones",
  heroTitle: "Generaciones",
  heroTaglineWhite: "No es una estrategia o un método.",
  heroTaglineCoral: "Se trata de corazón.",
  heroVerseText:
    "Una generación contará tus obras a la otra generación, y anunciará tus poderosos hechos.",
  heroVerseRef: "Salmos 145:4",

  visionTitleWhite1: "No venimos",
  visionTitleCoral1: "a mirar.",
  visionTitleWhite2: "Venimos",
  visionTitleCoral2: "a ser parte.",
  visionText:
    "Generaciones es un espacio donde niños y jóvenes descubren sus dones, sirven, crecen espiritualmente y comienzan a caminar en el propósito que Dios tiene para sus vidas.",
  visionClosing: "Estamos formando generaciones para Dios.",

  legacyTitleWhite: "Una generación\ncuenta a la otra.",
  legacyTitleCoral: "Y la historia continúa.",

  areasTitle: "Descubre tu lugar",
  areasIntro:
    "Cada área es una oportunidad para servir, aprender y descubrir los dones que Dios ha puesto en cada niño y joven. Toca cualquiera para ver los detalles.",
  areas: DEFAULT_AREAS,

  journeyTitle: "Un proceso para descubrir tu lugar",
  journey: DEFAULT_JOURNEY,

  ratioLeftPercent: "70",
  ratioLeftLabel: "Tu equipo base",
  ratioLeftText: "La mayor parte del tiempo, cada niño sirve y crece dentro de su área principal.",
  ratioRightPercent: "30",
  ratioRightLabel: "Servicio compartido",
  ratioRightText:
    "Algunos domingos sirve en otras áreas — mantiene una actitud humilde y descubre nuevas capacidades.",
  ratioClosingFaded: "Sin estrellas.",
  ratioClosingWhite: "Solo siervos.",

  altarTitle: "Toda área\nes altar.",
  altarText:
    "No importa si alguien canta, recibe a los visitantes, sirve en cafetería, apoya en logística o trabaja detrás de una cámara. Cada lugar de servicio tiene valor.",
  altarTagline: "Aquí no formamos figuras. Formamos corazones dispuestos a servir.",

  familiesTitle: "No formamos\ngeneraciones solos.",
  familiesText:
    "Generaciones también sucede en casa. El acompañamiento, la práctica, la oración, la puntualidad y el ejemplo de cada familia hacen parte del proceso.",
  parentsGuideUrl: "",

  nextDateEyebrow: "Próximo Generaciones",
  nextDate: null,
  nextDateNote: "Todavía no hay una fecha confirmada — en cuanto el equipo la publique, aparecerá aquí.",

  rhythm: DEFAULT_RHYTHM,

  safetyEyebrow: "Cuidado y seguridad",
  safetyTitle: "Crecer en un\nlugar seguro.",
  safetyPrinciples: DEFAULT_SAFETY_PRINCIPLES,
  careGuidelinesUrl: "",

  faqTitle: "¿Tienes preguntas?",
  faq: DEFAULT_FAQ,

  ctaTitle: "Hay un lugar\npara ti.",
  ctaTagline: "Descubre. Sirve. Crece.",
  ctaClosingWhite: "Porque no solo estamos formando iglesia…",
  ctaClosingHighlight: "estamos formando generaciones para Dios.",
};

function normalizeAreas(raw: unknown): GenerationsArea[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw as GenerationsArea[];
}

function normalizeStringArray(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw as string[];
}

function normalizeArray<T>(raw: unknown): T[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw as T[];
}

/** Mismo patrón que getAboutContent(): una fila en site_settings (key='generaciones'), merge sobre los defaults. */
export async function getGenerationsContent(): Promise<GenerationsContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "generaciones")
    .maybeSingle();

  if (!data?.value) return DEFAULT_GENERATIONS_CONTENT;
  const saved = data.value as Partial<GenerationsContent>;
  return {
    ...DEFAULT_GENERATIONS_CONTENT,
    ...saved,
    areas: normalizeAreas(saved.areas) ?? DEFAULT_GENERATIONS_CONTENT.areas,
    journey: normalizeArray(saved.journey) ?? DEFAULT_GENERATIONS_CONTENT.journey,
    rhythm: normalizeArray(saved.rhythm) ?? DEFAULT_GENERATIONS_CONTENT.rhythm,
    safetyPrinciples: normalizeStringArray(saved.safetyPrinciples) ?? DEFAULT_GENERATIONS_CONTENT.safetyPrinciples,
    faq: normalizeArray(saved.faq) ?? DEFAULT_GENERATIONS_CONTENT.faq,
  };
}
