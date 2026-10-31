import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/app/actions/session";
import { AuthForm } from "@/components/auth-form";
import { LocaleSwitch } from "@/components/locale-switch";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function LoginPage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const userId = await getUserId();

  if (userId) {
    const membership = await getMembership();
    redirect(membership ? "/clients" : "/company");
  }

  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <LocaleSwitch locale={locale} messages={messages} />
      <h1 className="text-pretty text-3xl font-semibold">{messages.login}</h1>
      <AuthForm action={signIn} messages={messages} mode="login" submitLabel={messages.login} />
      <Link href="/signup" className="inline-flex min-h-12 items-center text-base font-semibold text-stamp">
        {messages.signup}
      </Link>
    </main>
  );
}
