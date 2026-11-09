import { redirect } from "next/navigation";
import { InvitePanel } from "@/components/invite-panel";
import { PageFrame } from "@/components/page-frame";
import { Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CompanyMember, MemberRole } from "@/lib/types";

export default async function CompanyInvitePage() {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    redirect("/clients");
  }

  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  const [tenantResult, membersResult] = await Promise.all([
    supabase
      .from("tenants")
      .select("invite_code")
      .eq("id", membership.tenantId)
      .maybeSingle(),
    supabase
      .from("members")
      .select("id, role, removed_at")
      .eq("tenant_id", membership.tenantId)
      .order("created_at"),
  ]);

  const inviteCode = String(tenantResult.data?.invite_code ?? "");
  const members: CompanyMember[] = (membersResult.data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as MemberRole,
    removedAt: (row.removed_at as string | null) ?? null,
  }));

  return (
    <PageFrame
      locale={membership.locale}
      messages={messages}
      companyName={membership.tenantName}
      companyHref="/company/invite"
      showSignOut
    >
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.inviteTitle}</h1>
      <div className="mt-6">
        {!inviteCode ? (
          <Notice>{messages.saveFailed}</Notice>
        ) : (
          <InvitePanel inviteCode={inviteCode} members={members} messages={messages} />
        )}
      </div>
    </PageFrame>
  );
}
