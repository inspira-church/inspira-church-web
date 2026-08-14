"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { scheduleSchema } from "@/lib/validations/schedule";

function parseForm(formData: FormData) {
  return {
    type: formData.get("type"),
    name: formData.get("name"),
    dayOfWeek: formData.get("dayOfWeek"),
    timeOfDay: formData.get("timeOfDay"),
    location: formData.get("location") || undefined,
    orderIndex: formData.get("orderIndex") || 0,
    active: formData.get("active") === "on",
  };
}

export async function createSchedule(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = scheduleSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("schedules").insert({
    type: parsed.data.type,
    name: parsed.data.name,
    day_of_week: parsed.data.dayOfWeek,
    time_of_day: parsed.data.timeOfDay,
    location: parsed.data.location,
    order_index: parsed.data.orderIndex,
    active: parsed.data.active,
  });

  if (error) {
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  revalidatePath("/admin/horarios");
  revalidatePath("/");
  redirect("/admin/horarios");
}

export async function updateSchedule(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = scheduleSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("schedules")
    .update({
      type: parsed.data.type,
      name: parsed.data.name,
      day_of_week: parsed.data.dayOfWeek,
      time_of_day: parsed.data.timeOfDay,
      location: parsed.data.location,
      order_index: parsed.data.orderIndex,
      active: parsed.data.active,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/admin/horarios");
  revalidatePath("/");
  redirect("/admin/horarios");
}

export async function toggleScheduleActive(id: string, nextActive: boolean) {
  const supabase = await createClient();
  await supabase.from("schedules").update({ active: nextActive }).eq("id", id);
  revalidatePath("/admin/horarios");
  revalidatePath("/");
}
