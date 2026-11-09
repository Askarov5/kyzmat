import { redirect } from "next/navigation";
import { JoinForm } from "@/components/join-form";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId, lookupMembership } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface InviteTenantPageProps {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ pwd?: string }>;
}

export default async function InviteTenantPage({ params, searchParams }: InviteTenantPageProps) {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const { tenantId } = await params;
  const { pwd } = await searchParams;
  const password = typeof pwd === "string" ? pwd : "";
  const returnPath = `/invite/${encodeURIComponent(tenantId)}${
    password ? `?pwd=${encodeURIComponent(password)}` : ""
  }`;

  if (!(await getUserId())) {
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }

  const lookup = await lookupMembership();
  if (lookup.removed) {
    redirect("/removed");
  }

  const membership = await getMembership();
  if (membership) {
    redirect(membership.role === "owner" ? "/company" : "/clients");
  }

  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <PageFrame locale={locale} messages={messages} showSignOut>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.joinCompany}</h1>
      <p className="mt-2 text-sm text-mute">{messages.joinLead}</p>
      <div className="mt-6">
        <JoinForm
          messages={messages}
          initialTenantId={tenantId}
          initialPassword={password}
        />
      </div>
    </PageFrame>
  );
}
