import { redirect } from "next/navigation";
import { createCompany } from "@/app/actions/session";
import { AuthForm } from "@/components/auth-form";
import { LocaleSwitch } from "@/components/locale-switch";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function CompanyPage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  if (!(await getUserId())) {
    redirect("/login");
  }

  if (await getMembership()) {
    redirect("/clients");
  }

  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <LocaleSwitch locale={locale} messages={messages} />
      <h1 className="text-pretty text-3xl font-semibold">{messages.companyFinish}</h1>
      <AuthForm
        action={createCompany}
        messages={messages}
        mode="company"
        submitLabel={messages.createCompany}
      />
    </main>
  );
}
