"use server";

import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { placeById, type Place } from "@/lib/places";
import { toE164 } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export interface FormState {
  error: "required" | "address" | "phone" | "oblast" | "locality" | "owner" | "save" | null;
}

function chosenPlace(formData: FormData): { error: "oblast" | "locality" } | { place: Place } {
  const oblast = placeById(String(formData.get("oblastId") ?? ""));
  const place = placeById(String(formData.get("localityId") ?? ""));

  if (!oblast || oblast.parentId) {
    return { error: "oblast" };
  }

  if (!place || place.parentId !== oblast.id) {
    return { error: "locality" };
  }

  return { place };
}

export async function createClientRecord(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireMembership();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");
  const line = String(formData.get("line") ?? "").trim();
  const chosen = chosenPlace(formData);

  if (!displayName) {
    return { error: "required" };
  }

  if (!line) {
    return { error: "address" };
  }

  if ("error" in chosen) {
    return { error: chosen.error };
  }

  const place = chosen.place;

  let phone: string | null = null;

  if (phoneRaw.trim()) {
    phone = toE164(phoneRaw);

    if (!phone) {
      return { error: "phone" };
    }
  }

  const supabase = await createClient();
  const { data: locality, error: localityError } = await supabase
    .from("localities")
    .select("id")
    .eq("name_ky", place.nameKy)
    .maybeSingle();

  if (localityError || !locality) {
    return { error: "save" };
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      tenant_id: membership.tenantId,
      display_name: displayName,
      phone_e164: phone,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "save" };
  }

  const { error: addressError } = await supabase.from("addresses").insert({
    tenant_id: membership.tenantId,
    client_id: data.id,
    line,
    locality_id: locality.id,
  });

  if (addressError) {
    return { error: "save" };
  }

  redirect(`/clients/${data.id}`);
}

export async function addAddress(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireMembership();
  const clientId = String(formData.get("clientId") ?? "");
  const line = String(formData.get("line") ?? "").trim();
  const chosen = chosenPlace(formData);

  if (!line) {
    return { error: "address" };
  }

  if ("error" in chosen) {
    return { error: chosen.error };
  }

  const supabase = await createClient();
  const { data: locality, error: localityError } = await supabase
    .from("localities")
    .select("id")
    .eq("name_ky", chosen.place.nameKy)
    .maybeSingle();

  if (localityError || !locality) {
    return { error: "save" };
  }

  const { error } = await supabase.from("addresses").insert({
    tenant_id: membership.tenantId,
    client_id: clientId,
    line,
    locality_id: locality.id,
  });

  if (error) {
    return { error: "save" };
  }

  redirect(`/clients/${clientId}`);
}

export async function addNote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireMembership();
  const clientId = String(formData.get("clientId") ?? "");
  const phraseId = String(formData.get("phraseId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const authorId = claims?.claims?.sub;

  if (!authorId) {
    redirect("/login");
  }

  if (!body) {
    return { error: "required" };
  }

  let savedPhraseId: string | null = null;

  if (phraseId) {
    const { data: phrase, error } = await supabase
      .from("note_phrases")
      .select("id, body, use_count")
      .eq("id", phraseId)
      .eq("tenant_id", membership.tenantId)
      .maybeSingle();

    if (!error && phrase && (phrase.body as string) === body) {
      savedPhraseId = phrase.id as string;
      await supabase
        .from("note_phrases")
        .update({ use_count: (phrase.use_count as number) + 1 })
        .eq("id", phraseId);
    }
  }

  const { error: noteError } = await supabase.from("client_notes").insert({
    tenant_id: membership.tenantId,
    client_id: clientId,
    author_id: authorId,
    phrase_id: savedPhraseId,
    body,
  });

  if (noteError) {
    return { error: "save" };
  }

  redirect(`/clients/${clientId}`);
}

export async function archiveClient(formData: FormData) {
  await requireMembership();
  const clientId = String(formData.get("clientId") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("archive_client", {
    client_id: clientId,
  });

  if (error) {
    redirect(`/clients/${clientId}`);
  }

  redirect("/clients");
}
