import Link from "next/link";
import { redirect } from "next/navigation";
import { createCompany } from "@/app/actions/session";
import { AuthForm } from "@/components/auth-form";
import { CompanyDetailsForm } from "@/components/company-details-form";
import { InvitePanel } from "@/components/invite-panel";
import { PageFrame } from "@/components/page-frame";
import { Notice } from "@/components/ui";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId, lookupMembership, requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { CompanyDetails, CompanyMember, MemberRole } from "@/lib/types";

interface LocalityJoin {
  name_ky: string;
}

async function OwnerCompanyPage() {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    redirect("/clients");
  }

  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  const [tenantResult, membersResult] = await Promise.all([
    supabase
      .from("tenants")
      .select("name, invite_code, phone_e164, address_line, locality_id, localities(name_ky)")
      .eq("id", membership.tenantId)
      .maybeSingle(),
    supabase
      .from("members")
      .select("id, role, display_name, phone_e164, removed_at")
      .eq("tenant_id", membership.tenantId)
      .order("created_at"),
  ]);

  const inviteCode = String(tenantResult.data?.invite_code ?? "");
  const localityJoin = tenantResult.data?.localities as LocalityJoin | LocalityJoin[] | null;
  const locality = Array.isArray(localityJoin) ? localityJoin[0] : localityJoin;

  const details: CompanyDetails = {
    name: String(tenantResult.data?.name ?? membership.tenantName),
    phoneE164: (tenantResult.data?.phone_e164 as string | null) ?? null,
    addressLine: (tenantResult.data?.address_line as string | null) ?? null,
    localityId: (tenantResult.data?.locality_id as string | null) ?? null,
    localityKy: locality?.name_ky ?? null,
  };

  const members: CompanyMember[] = (membersResult.data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as MemberRole,
    displayName: (row.display_name as string | null) ?? null,
    phoneE164: (row.phone_e164 as string | null) ?? null,
    removedAt: (row.removed_at as string | null) ?? null,
  }));

  return (
    <PageFrame
      locale={membership.locale}
      messages={messages}
      companyName={details.name}
      companyHref="/company"
      showSignOut
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">
          {messages.companySettings}
        </h1>

        <section className="flex flex-col gap-3">
          <h2 className="border-b border-line pb-2 text-lg font-semibold">
            {messages.companyDetails}
          </h2>
          <CompanyDetailsForm details={details} messages={messages} locale={membership.locale} />
        </section>

        {!inviteCode ? (
          <Notice>{messages.saveFailed}</Notice>
        ) : (
          <InvitePanel inviteCode={inviteCode} members={members} messages={messages} />
        )}
      </div>
    </PageFrame>
  );
}

export default async function CompanyPage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  if (!(await getUserId())) {
    redirect("/login");
  }

  const lookup = await lookupMembership();
  if (lookup.removed) {
    redirect("/removed");
  }

  const membership = await getMembership();
  if (membership) {
    if (membership.role === "owner") {
      return await OwnerCompanyPage();
    }
    redirect("/clients");
  }

  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <PageFrame locale={locale} messages={messages} showSignOut>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.companyFinish}</h1>
      <div className="mt-6">
        <AuthForm action={createCompany} messages={messages} submitLabel={messages.createCompany} />
      </div>
      <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-lg font-semibold">{messages.joinCompany}</h2>
        <p className="text-sm text-mute">{messages.joinLead}</p>
        <Link
          href="/invite"
          className="choice inline-flex min-h-12 items-center justify-center text-sm font-semibold text-stamp"
        >
          {messages.joinCompany}
        </Link>
      </div>
    </PageFrame>
  );
}
