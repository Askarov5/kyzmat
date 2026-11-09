import { redirect } from "next/navigation";
import { createCompany } from "@/app/actions/session";
import { AuthForm } from "@/components/auth-form";
import { JoinForm } from "@/components/join-form";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId, lookupMembership } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

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
    redirect(membership.role === "owner" ? "/company/invite" : "/clients");
  }

  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <PageFrame locale={locale} messages={messages} showSignOut>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.companyFinish}</h1>
      <div className="mt-6">
        <AuthForm action={createCompany} messages={messages} submitLabel={messages.createCompany} />
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.joinCompany}</h2>
        <p className="text-sm text-mute">{messages.joinLead}</p>
        <JoinForm messages={messages} />
      </div>
    </PageFrame>
  );
}
