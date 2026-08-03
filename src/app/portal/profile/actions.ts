"use server";

import { profileUpdateSchema } from "@/lib/auth-schemas";
import { getPortalSession } from "@/lib/auth/portal-session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export type ProfileUpdateResult = { ok: true } | { ok: false; message: string };

export async function updateProfile(formData: FormData): Promise<ProfileUpdateResult> {
  const session = await getPortalSession();
  if (!session) return { ok: false, message: "Your session has expired. Please log in again." };

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    businessName: formData.get("businessName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your entries." };
  }

  const supabase = await createSupabaseServerClient();
  // RLS ("users can update their own profile") independently enforces
  // this even if the .eq() below were ever removed — defense in depth,
  // not the only barrier.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, business_name: parsed.data.businessName ?? null, phone: parsed.data.phone ?? null })
    .eq("id", session.id);

  if (error) {
    return { ok: false, message: "Something went wrong saving your profile. Please try again." };
  }

  revalidatePath("/portal/profile");
  return { ok: true };
}
