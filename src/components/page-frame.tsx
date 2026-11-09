import type { ReactNode } from "react";
import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
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
    <header className="sticky top-0 z-20 border-b border-line bg-sheet px-4 shadow-xs pt-[max(0.35rem,env(safe-area-inset-top))]">
      <div className="flex min-h-14 items-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 shrink-0 items-center text-primary-500 touch-manipulation"
          translate="no"
        >
          <Logo name={messages.appName} />
        </Link>
        <div className="ml-auto flex min-w-0 shrink-0 items-center">
          <AccountMenu
            locale={locale}
            messages={messages}
            companyName={companyName}
            companyHref={companyHref}
            showSignOut={showSignOut}
          />
        </div>
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
