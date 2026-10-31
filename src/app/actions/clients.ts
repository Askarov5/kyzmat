"use server";

import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { toE164 } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export interface FormState {
  error: "required" | "phone" | "locality" | "owner" | "save" | null;
}

export async function createClientRecord(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireMembership();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");

  if (!displayName) {
    return { error: "required" };
  }

  let phone: string | null = null;

  if (phoneRaw.trim()) {
    phone = toE164(phoneRaw);

    if (!phone) {
      return { error: "phone" };
    }
  }

  const supabase = await createClient();
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

  redirect(`/clients/${data.id}`);
}

export async function addAddress(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireMembership();
  const clientId = String(formData.get("clientId") ?? "");
  const line = String(formData.get("line") ?? "").trim();
  const localityId = String(formData.get("localityId") ?? "");

  if (!line) {
    return { error: "required" };
  }

  if (!localityId) {
    return { error: "locality" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("addresses").insert({
    tenant_id: membership.tenantId,
    client_id: clientId,
    line,
    locality_id: localityId,
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
  const newPhrase = String(formData.get("newPhrase") ?? "").trim();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const authorId = claims?.claims?.sub;

  if (!authorId) {
    redirect("/login");
  }

  let body = newPhrase;
  let savedPhraseId: string | null = phraseId || null;

  if (phraseId) {
    const { data: phrase, error } = await supabase
      .from("note_phrases")
      .select("id, body, use_count")
      .eq("id", phraseId)
      .eq("tenant_id", membership.tenantId)
      .maybeSingle();

    if (error || !phrase) {
      return { error: "save" };
    }

    body = phrase.body as string;
    await supabase
      .from("note_phrases")
      .update({ use_count: (phrase.use_count as number) + 1 })
      .eq("id", phraseId);
  } else if (newPhrase) {
    const { data: created, error } = await supabase
      .from("note_phrases")
      .insert({
        tenant_id: membership.tenantId,
        body: newPhrase,
        use_count: 1,
      })
      .select("id")
      .single();

    if (error || !created) {
      return { error: "save" };
    }

    savedPhraseId = created.id as string;
  } else {
    return { error: "required" };
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
