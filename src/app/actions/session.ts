"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE } from "@/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { parseLocale } from "@/i18n/locale";
import type { Locale } from "@/lib/types";

const PENDING_COMPANY = "kyzmat-pending-company";

export interface AuthState {
  error: "auth" | "required" | "confirm" | "company" | "member" | null;
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

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "auth" };
  }

  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_COMPANY)?.value;

  const { data: member } = await supabase
    .from("members")
    .select("locale")
    .maybeSingle();

  if (!member && pending) {
    const { error: companyError } = await supabase.rpc("create_company", {
      company_name: pending,
      tz: "Asia/Bishkek",
    });

    if (companyError) {
      return { error: "company" };
    }

    cookieStore.delete(PENDING_COMPANY);
  }

  const { data: refreshed } = await supabase
    .from("members")
    .select("locale")
    .maybeSingle();

  if (refreshed?.locale === "ru" || refreshed?.locale === "ky") {
    await setLocaleCookie(refreshed.locale);
  }

  if (!refreshed) {
    redirect("/company");
  }

  redirect("/clients");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();

  if (!email || !password || !companyName) {
    return { error: "required" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: "auth" };
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COMPANY, companyName, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  if (!data.session) {
    return { error: "confirm" };
  }

  const { error: companyError } = await supabase.rpc("create_company", {
    company_name: companyName,
    tz: "Asia/Bishkek",
  });

  if (companyError) {
    return { error: companyError.message.includes("already") ? "member" : "company" };
  }

  cookieStore.delete(PENDING_COMPANY);
  await setLocaleCookie("ky");
  redirect("/clients");
}

export async function createCompany(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const companyName = String(formData.get("companyName") ?? "").trim();

  if (!companyName) {
    return { error: "required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_company", {
    company_name: companyName,
    tz: "Asia/Bishkek",
  });

  if (error) {
    return { error: error.message.includes("already") ? "member" : "company" };
  }

  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COMPANY);
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
