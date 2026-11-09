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
  next?: string | null;
}

export function AuthScreen({ intent, locale, messages, failed, next = null }: AuthScreenProps) {
  const signingUp = intent === "signup";
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <PageFrame locale={locale} messages={messages}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-pretty text-3xl font-semibold tracking-tight">
            {signingUp ? messages.signup : messages.login}
          </h1>
          <p className="max-w-[28ch] text-base leading-snug text-mute">
            {signingUp ? messages.signupLead : messages.loginLead}
          </p>
        </header>

        <SignInPanel intent={intent} messages={messages} failed={failed} next={next} />

        <p className="border-t border-line pt-4 text-sm text-mute">
          {signingUp ? (
            <Link
              href={loginHref}
              className="inline-flex min-h-12 items-center font-semibold text-stamp touch-manipulation"
            >
              {messages.haveCompany}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center font-semibold text-stamp touch-manipulation"
            >
              {messages.openCompany}
            </Link>
          )}
        </p>
      </div>
    </PageFrame>
  );
}
