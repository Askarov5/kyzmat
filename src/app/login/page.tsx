import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const userId = await getUserId();

  if (userId) {
    const membership = await getMembership();
    redirect(membership ? "/clients" : "/company");
  }

  const params = await searchParams;
  const locale = await getLocale();

  return (
    <AuthScreen
      intent="login"
      locale={locale}
      messages={messagesFor(locale)}
      failed={params.error === "auth"}
    />
  );
}
