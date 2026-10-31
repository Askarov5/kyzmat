import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale, Membership, MemberRole } from "@/lib/types";

export const getUserId = cache(async (): Promise<string | null> => {
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

export const getMembership = cache(async (): Promise<Membership | null> => {
  const userId = await getUserId();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("tenant_id, role, locale, tenants(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const tenant = data.tenants as { name: string } | { name: string }[] | null;
  const tenantName = Array.isArray(tenant) ? tenant[0]?.name : tenant?.name;

  if (!tenantName) {
    return null;
  }

  return {
    tenantId: data.tenant_id as string,
    tenantName,
    role: data.role as MemberRole,
    locale: data.locale as Locale,
  };
});

export async function requireMembership(): Promise<Membership> {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const userId = await getUserId();

  if (!userId) {
    redirect("/login");
  }

  const membership = await getMembership();

  if (!membership) {
    redirect("/company");
  }

  return membership;
}
