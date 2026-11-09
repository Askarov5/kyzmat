import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { SignInPanel } from "@/components/sign-in-panel";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface AuthScreenProps {
  intent: "login" | "signup";
  locale: Locale;
  messages: Messages;
  failed: boolean;
}

export function AuthScreen({ intent, locale, messages, failed }: AuthScreenProps) {
  const signingUp = intent === "signup";

  return (
    <PageFrame locale={locale} messages={messages}>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{signingUp ? messages.signup : messages.login}</h1>
      <p className="mt-2 max-w-[28ch] text-base text-mute">
        {signingUp ? messages.signupLead : messages.loginLead}
      </p>
      <div className="mt-6">
        <SignInPanel intent={intent} messages={messages} failed={failed} />
      </div>
      <p className="mt-auto pt-8">
        {signingUp ? (
          <Link href="/login" className="inline-flex min-h-12 items-center text-base font-semibold text-stamp">
            {messages.haveCompany}
          </Link>
        ) : (
          <Link href="/signup" className="inline-flex min-h-12 items-center text-base font-semibold text-stamp">
            {messages.openCompany}
          </Link>
        )}
      </p>
    </PageFrame>
  );
}
