"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { placeById, type Place } from "@/lib/places";
import { toKyrgyzE164 } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export interface CompanyActionState {
  error: "owner" | "code" | "member" | "save" | null;
  code: string | null;
}

export interface CompanyDetailsState {
  error:
    | "owner"
    | "required"
    | "phone"
    | "address"
    | "oblast"
    | "locality"
    | "save"
    | null;
}

function chosenPlace(
  formData: FormData,
): { error: "oblast" | "locality" } | { place: Place } | { place: null } {
  const oblastRaw = String(formData.get("oblastId") ?? "").trim();
  const localityRaw = String(formData.get("localityId") ?? "").trim();

  if (!oblastRaw && !localityRaw) {
    return { place: null };
  }

  const oblast = placeById(oblastRaw);
  const place = placeById(localityRaw);

  if (!oblast || oblast.parentId) {
    return { error: "oblast" };
  }

  if (!place || place.parentId !== oblast.id) {
    return { error: "locality" };
  }

  return { place };
}

export async function updateCompany(
  _prev: CompanyDetailsState,
  formData: FormData,
): Promise<CompanyDetailsState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "owner" };
  }

  const name = String(formData.get("companyName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const addressLine = String(formData.get("addressLine") ?? "").trim();
  const chosen = chosenPlace(formData);

  if (!name) {
    return { error: "required" };
  }

  let phone: string | null = null;
  if (phoneRaw && phoneRaw !== "+996") {
    phone = toKyrgyzE164(phoneRaw);
    if (!phone) {
      return { error: "phone" };
    }
  }

  let localityId: string | null = null;

  if (addressLine) {
    if ("error" in chosen) {
      return { error: chosen.error };
    }

    if (!chosen.place) {
      return { error: "address" };
    }

    const supabaseLookup = await createClient();
    const { data: locality, error: localityError } = await supabaseLookup
      .from("localities")
      .select("id")
      .eq("name_ky", chosen.place.nameKy)
      .maybeSingle();

    if (localityError || !locality) {
      return { error: "save" };
    }

    localityId = locality.id as string;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_company", {
    company_name: name,
    phone,
    addr_line: addressLine || null,
    loc_id: localityId,
  });

  if (error) {
    const text = [error.message, error.details, error.hint].filter(Boolean).join(" ").toLowerCase();
    if (text.includes("owner only")) return { error: "owner" };
    if (text.includes("bad phone")) return { error: "phone" };
    if (text.includes("bad address") || text.includes("bad locality")) return { error: "address" };
    if (text.includes("company name")) return { error: "required" };
    return { error: "save" };
  }

  revalidatePath("/company");
  revalidatePath("/clients");
  revalidatePath("/orders");
  revalidatePath("/products");
  return { error: null };
}

export async function setMemberRole(
  _prev: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "owner", code: null };
  }

  const memberId = String(formData.get("memberId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!memberId || (role !== "agent" && role !== "warehouse")) {
    return { error: "save", code: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_member_role", {
    mid: memberId,
    next_role: role,
  });

  if (error) {
    return { error: "save", code: null };
  }

  revalidatePath("/company");
  return { error: null, code: null };
}

export async function rotateInviteCode(
  _prev: CompanyActionState,
): Promise<CompanyActionState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "owner", code: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rotate_invite_code");

  if (error || !data) {
    return { error: "save", code: null };
  }

  revalidatePath("/company");
  return { error: null, code: String(data) };
}

export async function removeMember(
  _prev: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "owner", code: null };
  }

  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) {
    return { error: "save", code: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_member", { mid: memberId });

  if (error) {
    return { error: "save", code: null };
  }

  revalidatePath("/company");
  return { error: null, code: null };
}

export async function restoreMember(
  _prev: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "owner", code: null };
  }

  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) {
    return { error: "save", code: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("restore_member", { mid: memberId });

  if (error) {
    return { error: "save", code: null };
  }

  revalidatePath("/company");
  return { error: null, code: null };
}

export async function joinCompany(
  _prev: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!code) {
    return { error: "code", code: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_company", { code });

  if (error) {
    if (error.message.includes("already")) {
      return { error: "member", code: null };
    }
    if (error.message.includes("bad code")) {
      return { error: "code", code: null };
    }
    return { error: "save", code: null };
  }

  redirect("/clients");
}
