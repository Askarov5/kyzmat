import { cache } from "react";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale, Membership, MemberRole } from "@/lib/types";

const previewUserId = "00000000-0000-4000-8000-000000000002";

function skipAuth(): boolean {
  return process.env.NODE_ENV === "development" && process.env.KYZMAT_SKIP_AUTH === "1";
}

export const getUserId = cache(async (): Promise<string | null> => {
  if (skipAuth()) {
    return previewUserId;
  }

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  return data.claims.sub;
});

export interface MembershipLookup {
  membership: Membership | null;
  removed: boolean;
  removedLocale: Locale | null;
}

export const lookupMembership = cache(async (): Promise<MembershipLookup> => {
  if (skipAuth()) {
    return {
      membership: {
        tenantId: "00000000-0000-4000-8000-000000000001",
        tenantName: "Сынак",
        role: "owner",
        locale: await getLocale(),
      },
      removed: false,
      removedLocale: null,
    };
  }

  const userId = await getUserId();

  if (!userId) {
    return { membership: null, removed: false, removedLocale: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("tenant_id, role, locale, removed_at, tenants(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { membership: null, removed: false, removedLocale: null };
  }

  const tenant = data.tenants as { name: string } | { name: string }[] | null;
  const tenantName = Array.isArray(tenant) ? tenant[0]?.name : tenant?.name;
  const locale = (data.locale as Locale) || "ky";

  if (data.removed_at) {
    return {
      membership: null,
      removed: true,
      removedLocale: locale,
    };
  }

  if (!tenantName) {
    return { membership: null, removed: false, removedLocale: null };
  }

  return {
    membership: {
      tenantId: data.tenant_id as string,
      tenantName,
      role: data.role as MemberRole,
      locale,
    },
    removed: false,
    removedLocale: null,
  };
});

export const getMembership = cache(async (): Promise<Membership | null> => {
  const lookup = await lookupMembership();
  return lookup.membership;
});

export async function requireMembership(): Promise<Membership> {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const userId = await getUserId();

  if (!userId) {
    redirect("/login");
  }

  const lookup = await lookupMembership();

  if (lookup.removed) {
    redirect("/removed");
  }

  if (!lookup.membership) {
    redirect("/company");
  }

  return lookup.membership;
}

export function canBook(role: MemberRole): boolean {
  return role === "owner" || role === "agent";
}

export function canManagePile(role: MemberRole): boolean {
  return role === "owner" || role === "warehouse";
}
