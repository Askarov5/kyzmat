import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/actions/session";
import { LocaleSwitch } from "@/components/locale-switch";
import { Slip } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface SiteHeaderProps {
  locale: Locale;
  messages: Messages;
  companyName?: string;
  companyHref?: string;
  showSignOut?: boolean;
}

export function SiteHeader({
  locale,
  messages,
  companyName,
  companyHref,
  showSignOut = false,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white px-4 shadow-xs pt-[max(0.25rem,env(safe-area-inset-top))]">
      <div className="flex min-h-12 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <Link
            href="/"
            className="inline-flex min-h-12 shrink-0 items-center text-base font-semibold tracking-tight text-primary-500"
            translate="no"
          >
            {messages.appName}
          </Link>
          {companyName ? (
            companyHref ? (
              <Link
                href={companyHref}
                className="min-w-0 truncate text-sm text-mute"
                title={companyName}
              >
                {companyName}
              </Link>
            ) : (
              <p className="min-w-0 truncate text-sm text-mute" title={companyName}>
                {companyName}
              </p>
            )
          ) : null}
        </div>
        <LocaleSwitch locale={locale} messages={messages} />
        {showSignOut ? (
          <form action={signOut} className="shrink-0">
            <button type="submit" className="sign-out min-h-12 px-2 text-sm font-semibold text-mute">
              {messages.logout}
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}

interface PageFrameProps {
  locale: Locale;
  messages: Messages;
  companyName?: string;
  companyHref?: string;
  showSignOut?: boolean;
  dock?: ReactNode;
  children: ReactNode;
}

export function PageFrame({
  locale,
  messages,
  companyName,
  companyHref,
  showSignOut = false,
  dock,
  children,
}: PageFrameProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <SiteHeader
        locale={locale}
        messages={messages}
        companyName={companyName}
        companyHref={companyHref}
        showSignOut={showSignOut}
      />
      <main id="main" className={`flex flex-1 flex-col px-4 pt-3 ${dock ? "pb-28" : "pb-8"}`}>
        <Slip>{children}</Slip>
      </main>
      {dock}
    </div>
  );
}
