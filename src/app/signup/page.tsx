import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { getMembership, getUserId } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function SignupPage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const userId = await getUserId();

  if (userId) {
    const membership = await getMembership();
    redirect(membership ? "/clients" : "/company");
  }

  const locale = await getLocale();

  return (
    <AuthScreen intent="signup" locale={locale} messages={messagesFor(locale)} failed={false} />
  );
}
