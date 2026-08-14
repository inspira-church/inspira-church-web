// Datos de ejemplo para construir y probar el sitio público (Fase 5) antes
// de conectar Supabase de verdad. Las fotos usan picsum.photos (servicio de
// imágenes placeholder) — se reemplazan por Supabase Storage cuando cada
// módulo tenga su CRUD (Fases 8-10). El video de YouTube es un ID real y
// estable ("Me at the zoo", el primer video de YouTube) usado solo para
// probar que el embed funciona técnicamente.

import type {
  ChurchEvent,
  GrowthGroup,
  Schedule,
  Sermon,
  SermonSeries,
  TeamMember,
} from "@/types/content";

const photo = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;
const cover = (seed: string, w = 800, h = 500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PLACEHOLDER_YOUTUBE_URL = "https://www.youtube.com/watch?v=jNQXAC9IVRw";

export const teamMembers: TeamMember[] = [
  {
    id: "tm-1",
    fullName: "Carlos Ramírez",
    type: "pastor",
    roleTitle: "Pastor Principal",
    bio: "Carlos y su esposa Diana fundaron Inspira Church con el deseo de crear una comunidad cercana donde cada persona pueda encontrar propósito. Lleva más de 15 años en el ministerio pastoral.",
    photoUrl: photo("carlos"),
    orderIndex: 1,
  },
  {
    id: "tm-2",
    fullName: "Diana Ramírez",
    type: "pastor",
    roleTitle: "Copastora",
    bio: "Diana lidera el área de consejería y familia. Apasionada por acompañar procesos de sanidad y crecimiento personal dentro de la iglesia.",
    photoUrl: photo("diana"),
    orderIndex: 2,
  },
  {
    id: "tm-3",
    fullName: "Andrés Beltrán",
    type: "pastor",
    roleTitle: "Pastor de Jóvenes",
    bio: "Andrés dirige el ministerio de jóvenes y adolescentes, enfocado en discipulado y liderazgo para la nueva generación.",
    photoUrl: photo("andres"),
    orderIndex: 3,
  },
  {
    id: "tm-4",
    fullName: "Laura Cifuentes",
    type: "lider",
    roleTitle: "Líder de Alabanza",
    bio: "Laura coordina el equipo de alabanza y adoración de todos los servicios.",
    photoUrl: photo("laura"),
    orderIndex: 4,
  },
  {
    id: "tm-5",
    fullName: "Julián Torres",
    type: "lider",
    roleTitle: "Líder de Grupos de Crecimiento",
    bio: "Julián acompaña a los líderes de cada grupo de crecimiento y ayuda a las personas nuevas a encontrar uno cerca de casa.",
    photoUrl: photo("julian"),
    orderIndex: 5,
  },
];

export const sermonSeries: SermonSeries[] = [
  {
    id: "ss-1",
    name: "Raíces",
    slug: "raices",
    description:
      "Una serie sobre los fundamentos de la fe: qué creemos y por qué lo creemos.",
    coverImageUrl: cover("raices"),
  },
  {
    id: "ss-2",
    name: "Familias que Inspiran",
    slug: "familias-que-inspiran",
    description:
      "Principios prácticos para el matrimonio, la crianza y las relaciones familiares.",
    coverImageUrl: cover("familias"),
  },
  {
    id: "ss-3",
    name: "Vidas con Propósito",
    slug: "vidas-con-proposito",
    description: "Descubriendo el propósito de Dios para cada etapa de la vida.",
    coverImageUrl: cover("proposito"),
  },
];

export const sermons: Sermon[] = [
  {
    id: "sm-1",
    title: "El fundamento que no se mueve",
    slug: "el-fundamento-que-no-se-mueve",
    seriesId: "ss-1",
    preacherId: "tm-1",
    description:
      "Por qué construir la vida sobre bases sólidas cambia la forma en que enfrentamos las tormentas.",
    youtubeUrl: PLACEHOLDER_YOUTUBE_URL,
    thumbnailUrl: cover("s1"),
    sermonDate: "2026-07-05",
    topics: ["fe", "fundamentos"],
    published: true,
  },
  {
    id: "sm-2",
    title: "Gracia antes que ley",
    slug: "gracia-antes-que-ley",
    seriesId: "ss-1",
    preacherId: "tm-1",
    description: "Entendiendo el corazón del evangelio.",
    youtubeUrl: PLACEHOLDER_YOUTUBE_URL,
    thumbnailUrl: cover("s2"),
    sermonDate: "2026-07-12",
    topics: ["fe", "gracia"],
    published: true,
  },
  {
    id: "sm-3",
    title: "Matrimonios que perduran",
    slug: "matrimonios-que-perduran",
    seriesId: "ss-2",
    preacherId: "tm-2",
    description: "Tres decisiones diarias que sostienen un matrimonio sano.",
    youtubeUrl: PLACEHOLDER_YOUTUBE_URL,
    thumbnailUrl: cover("s3"),
    sermonDate: "2026-07-19",
    topics: ["familia", "matrimonio"],
    published: true,
  },
  {
    id: "sm-4",
    title: "Criar sin perder la calma",
    slug: "criar-sin-perder-la-calma",
    seriesId: "ss-2",
    preacherId: "tm-2",
    description: "Crianza con gracia, límites y mucha paciencia.",
    youtubeUrl: PLACEHOLDER_YOUTUBE_URL,
    thumbnailUrl: cover("s4"),
    sermonDate: "2026-07-26",
    topics: ["familia", "crianza"],
    published: true,
  },
  {
    id: "sm-5",
    title: "Diseñado con intención",
    slug: "disenado-con-intencion",
    seriesId: "ss-3",
    preacherId: "tm-3",
    description: "Nadie está aquí por accidente.",
    youtubeUrl: PLACEHOLDER_YOUTUBE_URL,
    thumbnailUrl: cover("s5"),
    sermonDate: "2026-08-02",
    topics: ["propósito", "identidad"],
    published: true,
  },
  {
    id: "sm-6",
    title: "El siguiente paso",
    slug: "el-siguiente-paso",
    seriesId: "ss-3",
    preacherId: "tm-3",
    description: "No necesitas ver todo el camino para dar el primer paso.",
    youtubeUrl: PLACEHOLDER_YOUTUBE_URL,
    thumbnailUrl: cover("s6"),
    sermonDate: "2026-08-09",
    topics: ["propósito", "fe"],
    published: true,
  },
];

export const growthGroups: GrowthGroup[] = [
  {
    id: "gg-1",
    name: "Real Love",
    slug: "real-love",
    groupType: "Jóvenes",
    description:
      "Grupo de jóvenes entre 18 y 28 años. Estudio bíblico, adoración y mucha comunidad.",
    city: "Bogotá",
    locality: "Suba",
    sector: "Suba Rincón",
    latApprox: 4.711,
    lngApprox: -74.0721,
    dayOfWeek: 3,
    timeOfDay: "19:00",
    leaderFullName: "Julián Torres",
    leaderPhotoUrl: photo("julian"),
    coleaderFullName: "Camila Rojas",
  },
  {
    id: "gg-2",
    name: "Raíces Chapinero",
    slug: "raices-chapinero",
    groupType: "Células familiares",
    description:
      "Grupo intergeneracional para familias del sector. Cena compartida y estudio bíblico.",
    city: "Bogotá",
    locality: "Chapinero",
    sector: "Chapinero Alto",
    latApprox: 4.6488,
    lngApprox: -74.063,
    dayOfWeek: 5,
    timeOfDay: "19:30",
    leaderFullName: "Andrés Beltrán",
    leaderPhotoUrl: photo("andres"),
    coleaderFullName: null,
  },
  {
    id: "gg-3",
    name: "Mujeres de Fe",
    slug: "mujeres-de-fe",
    groupType: "Mujeres",
    description: "Espacio para mujeres de todas las edades — oración, estudio y amistad.",
    city: "Bogotá",
    locality: "Usaquén",
    sector: "Santa Bárbara",
    latApprox: 4.6946,
    lngApprox: -74.0307,
    dayOfWeek: 2,
    timeOfDay: "18:30",
    leaderFullName: "Diana Ramírez",
    leaderPhotoUrl: photo("diana"),
    coleaderFullName: "Marcela Duque",
  },
  {
    id: "gg-4",
    name: "Matrimonios Kennedy",
    slug: "matrimonios-kennedy",
    groupType: "Matrimonios",
    description: "Grupo de parejas casadas — herramientas prácticas para el matrimonio.",
    city: "Bogotá",
    locality: "Kennedy",
    sector: "Kennedy Central",
    latApprox: 4.628,
    lngApprox: -74.1495,
    dayOfWeek: 6,
    timeOfDay: "16:00",
    leaderFullName: "Carlos Ramírez",
    leaderPhotoUrl: photo("carlos"),
    coleaderFullName: "Diana Ramírez",
  },
  {
    id: "gg-5",
    name: "Conexión Engativá",
    slug: "conexion-engativa",
    groupType: "Jóvenes",
    description: "Grupo de jóvenes y jóvenes adultos del occidente de la ciudad.",
    city: "Bogotá",
    locality: "Engativá",
    sector: "Las Ferias",
    latApprox: 4.69,
    lngApprox: -74.1174,
    dayOfWeek: 4,
    timeOfDay: "19:00",
    leaderFullName: "Laura Cifuentes",
    leaderPhotoUrl: photo("laura"),
    coleaderFullName: null,
  },
];

export const events: ChurchEvent[] = [
  {
    id: "ev-1",
    name: "Conferencia de Familias 2026",
    slug: "conferencia-familias-2026",
    description:
      "Dos días de enseñanza práctica para fortalecer el matrimonio y la crianza, con invitados especiales.",
    imageUrl: cover("conferencia", 1200, 630),
    eventDate: "2026-09-12",
    eventTime: "09:00",
    locationName: "Auditorio Principal Inspira Church",
    address: "Calle 100 # 15-20, Bogotá",
    lat: 4.6946,
    lng: -74.0307,
    capacity: 300,
    registrationUrl: "https://forms.gle/ejemplo-conferencia-familias",
    status: "proximo",
    published: true,
  },
  {
    id: "ev-2",
    name: "Noche de Adoración",
    slug: "noche-de-adoracion",
    description: "Una noche completa dedicada a la adoración y la oración congregacional.",
    imageUrl: cover("adoracion", 1200, 630),
    eventDate: "2026-08-28",
    eventTime: "19:00",
    locationName: "Auditorio Principal Inspira Church",
    address: "Calle 100 # 15-20, Bogotá",
    lat: 4.6946,
    lng: -74.0307,
    capacity: null,
    registrationUrl: null,
    status: "proximo",
    published: true,
  },
  {
    id: "ev-3",
    name: "Retiro de Jóvenes",
    slug: "retiro-de-jovenes",
    description: "Un fin de semana fuera de la ciudad para desconectar y crecer en comunidad.",
    imageUrl: cover("retiro", 1200, 630),
    eventDate: "2026-10-03",
    eventTime: "07:00",
    locationName: "Centro Campestre El Roble",
    address: "Km 12 vía La Calera",
    lat: 4.7186,
    lng: -73.9669,
    capacity: 80,
    registrationUrl: "https://forms.gle/ejemplo-retiro-jovenes",
    status: "proximo",
    published: true,
  },
  {
    id: "ev-4",
    name: "Vigilia de Año Nuevo",
    slug: "vigilia-de-ano-nuevo",
    description: "Cerramos el año en oración y acción de gracias.",
    imageUrl: cover("vigilia", 1200, 630),
    eventDate: "2025-12-31",
    eventTime: "21:00",
    locationName: "Auditorio Principal Inspira Church",
    address: "Calle 100 # 15-20, Bogotá",
    lat: 4.6946,
    lng: -74.0307,
    capacity: null,
    registrationUrl: null,
    status: "finalizado",
    published: true,
  },
];

export const schedules: Schedule[] = [
  {
    id: "sc-1",
    type: "servicio",
    name: "Servicio Dominical",
    dayOfWeek: 0,
    timeOfDay: "09:00",
    location: "Auditorio Principal",
    orderIndex: 1,
  },
  {
    id: "sc-2",
    type: "servicio",
    name: "Servicio Dominical",
    dayOfWeek: 0,
    timeOfDay: "11:30",
    location: "Auditorio Principal",
    orderIndex: 2,
  },
  {
    id: "sc-3",
    type: "reunion",
    name: "Noche de Oración",
    dayOfWeek: 3,
    timeOfDay: "18:30",
    location: "Auditorio Principal",
    orderIndex: 3,
  },
  {
    id: "sc-4",
    type: "actividad",
    name: "Escuela Dominical (niños)",
    dayOfWeek: 0,
    timeOfDay: "09:00",
    location: "Salón Kids",
    orderIndex: 4,
  },
];

export function getSermonBySlug(slug: string) {
  return sermons.find((s) => s.slug === slug);
}

export function getSeriesBySlug(slug: string) {
  return sermonSeries.find((s) => s.slug === slug);
}

export function getGroupBySlug(slug: string) {
  return growthGroups.find((g) => g.slug === slug);
}

export function getEventBySlug(slug: string) {
  return events.find((e) => e.slug === slug);
}

export function getTeamMember(id: string | null) {
  return teamMembers.find((t) => t.id === id) ?? null;
}

export function getSeries(id: string | null) {
  return sermonSeries.find((s) => s.id === id) ?? null;
}

export function getSermonsBySeries(seriesId: string) {
  return sermons.filter((s) => s.seriesId === seriesId);
}
