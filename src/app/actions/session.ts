"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE } from "@/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { parseLocale } from "@/i18n/locale";
import { toKyrgyzE164 } from "@/lib/phone";
import type { Locale } from "@/lib/types";

const PENDING_COMPANY = "kyzmat-pending-company";

export interface AuthState {
  error: "auth" | "required" | "phone" | "code" | "company" | "member" | null;
  sentTo: string | null;
}

async function setLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function switchLocale(locale: Locale) {
  const next = parseLocale(locale);
  await setLocaleCookie(next);

  if (!hasSupabaseEnv()) {
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    await supabase.rpc("set_locale", { next_locale: next });
  }
}

export async function rememberCompany(companyName: string) {
  const name = companyName.trim();

  if (!name) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COMPANY, name, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

async function openPendingCompany() {
  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_COMPANY)?.value?.trim();

  if (!pending || !hasSupabaseEnv()) {
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("members").select("user_id").maybeSingle();

  if (!data) {
    await supabase.rpc("create_company", {
      company_name: pending,
      tz: "Asia/Bishkek",
    });
  }

  cookieStore.delete(PENDING_COMPANY);
}

export async function sendWhatsAppCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phone = toKyrgyzE164(String(formData.get("phone") ?? ""));
  const companyName = String(formData.get("companyName") ?? "").trim();
  const starting = formData.get("intent") === "signup";

  if (starting && !companyName) {
    return { error: "required", sentTo: null };
  }

  if (!phone) {
    return { error: "phone", sentTo: null };
  }

  if (companyName) {
    await rememberCompany(companyName);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "whatsapp" },
  });

  if (error) {
    return { error: "auth", sentTo: null };
  }

  return { error: null, sentTo: phone };
}

export async function verifyWhatsAppCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phone = toKyrgyzE164(String(formData.get("phone") ?? ""));
  const token = String(formData.get("token") ?? "").replace(/\D/g, "");

  if (!phone || token.length < 6) {
    return { error: "code", sentTo: phone };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    return { error: "code", sentTo: phone };
  }

  await openPendingCompany();
  redirect("/");
}

export async function createCompany(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const companyName = String(formData.get("companyName") ?? "").trim();

  if (!companyName) {
    return { error: "required", sentTo: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_company", {
    company_name: companyName,
    tz: "Asia/Bishkek",
  });

  if (error) {
    return { error: error.message.includes("already") ? "member" : "company", sentTo: null };
  }

  await setLocaleCookie("ky");
  redirect("/clients");
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
