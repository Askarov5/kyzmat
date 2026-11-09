"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface CompanyActionState {
  error: "owner" | "code" | "member" | "save" | null;
  code: string | null;
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

  revalidatePath("/company/invite");
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

  revalidatePath("/company/invite");
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

  revalidatePath("/company/invite");
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
