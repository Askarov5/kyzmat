import { redirect } from "next/navigation";
import { PageFrame } from "@/components/page-frame";
import { ButtonLink, Notice } from "@/components/ui";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getUserId, lookupMembership } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function RemovedPage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  if (!(await getUserId())) {
    redirect("/login");
  }

  const lookup = await lookupMembership();

  if (!lookup.removed) {
    if (lookup.membership) {
      redirect("/clients");
    }
    redirect("/company");
  }

  const locale = lookup.removedLocale ?? (await getLocale());
  const messages = messagesFor(locale);
  const supabase = await createClient();
  await supabase.auth.signOut();

  return (
    <PageFrame locale={locale} messages={messages}>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.inviteTitle}</h1>
      <div className="mt-6 flex flex-col gap-4">
        <Notice>{messages.removedNotice}</Notice>
        <ButtonLink href="/login">{messages.login}</ButtonLink>
      </div>
    </PageFrame>
  );
}
