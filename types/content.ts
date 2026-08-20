// Formas de datos usadas por el sitio público. Reflejan exactamente las
// columnas de supabase/migrations — cuando Supabase se conecte (Fase 6+) y
// se generen los tipos reales (ver types/database.types.ts), estos tipos se
// reemplazan por los generados; hasta entonces son la fuente de verdad para
// components/ y lib/mock-data.ts.

export type TeamMemberType = "pastor" | "lider";

export interface TeamMember {
  id: string;
  fullName: string;
  type: TeamMemberType;
  roleTitle: string;
  bio: string;
  photoUrl: string;
  orderIndex: number;
}

export interface SermonSeries {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
}

export interface Sermon {
  id: string;
  title: string;
  slug: string;
  seriesId: string | null;
  preacherId: string | null;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  sermonDate: string; // YYYY-MM-DD
  topics: string[];
  published: boolean;
}

export interface GrowthGroup {
  id: string;
  name: string;
  slug: string;
  groupType: string;
  description: string;
  city: string;
  locality: string | null;
  sector: string | null;
  latApprox: number | null;
  lngApprox: number | null;
  dayOfWeek: number; // 0 = domingo … 6 = sábado
  timeOfDay: string; // "19:00"
  leaderFullName: string | null;
  leaderPhotoUrl: string | null;
  coleaderFullName: string | null;
}

/** Tal como se guarda en Supabase — "cancelado" es la única bandera manual real. "proximo" vs "finalizado" se recalculan siempre por fecha, ver lib/event-status.ts. */
export type EventStatus = "proximo" | "finalizado" | "cancelado";

export type EventModality = "presencial" | "virtual" | "hibrido";

export type EventRegistrationStatus = "abiertas" | "ultimos_cupos" | "cerradas" | "agotado";

export interface EventPracticalInfoItem {
  title: string;
  content: string;
}

export interface ChurchEvent {
  id: string;
  name: string;
  subtitle: string | null;
  slug: string;
  description: string;
  imageUrl: string;
  promoVideoUrl: string | null;
  eventDate: string;
  eventTime: string | null;
  endDate: string | null;
  endTime: string | null;
  locationName: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  locationPublic: boolean;
  modality: EventModality;
  category: string | null;
  capacity: number | null;
  requiresRegistration: boolean;
  registrationUrl: string | null;
  registrationStatus: EventRegistrationStatus | null;
  showCountdown: boolean;
  practicalInfo: EventPracticalInfoItem[];
  cost: string | null;
  ageRange: string | null;
  status: EventStatus;
  published: boolean;
}

export type ScheduleType = "servicio" | "reunion" | "grupo" | "actividad";

export interface Schedule {
  id: string;
  type: ScheduleType;
  name: string;
  dayOfWeek: number;
  timeOfDay: string;
  location: string | null;
  orderIndex: number;
}
