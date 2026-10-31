import Link from "next/link";
import { signOut } from "@/app/actions/session";
import { LocaleSwitch } from "@/components/locale-switch";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface AppShellProps {
  locale: Locale;
  messages: Messages;
  companyName: string;
  children: React.ReactNode;
}

const laterItems = ["orders", "products", "due"] as const;

export function AppShell({ locale, messages, companyName, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="text-sm font-semibold" translate="no">
            {messages.appName}
          </p>
          <p className="truncate text-sm text-ink/70">{companyName}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="min-h-12 px-2 text-sm font-semibold">
            {messages.logout}
          </button>
        </form>
      </header>
      <div className="px-4 pt-3">
        <LocaleSwitch locale={locale} messages={messages} />
      </div>
      <main id="main" className="flex-1 px-4 py-4 pb-28">
        {children}
      </main>
      <nav className="dock fixed inset-x-0 bottom-0" aria-label={messages.clients}>
        <div className="mx-auto grid max-w-md grid-cols-4">
          <Link href="/clients" className="nav-item flex items-center justify-center text-sm font-semibold text-stamp" aria-current="page">
            {messages.clients}
          </Link>
          {laterItems.map((item) => (
            <span
              key={item}
              className="nav-item flex items-center justify-center text-center text-xs text-ink/40"
              aria-disabled="true"
            >
              {messages[item]}
            </span>
          ))}
        </div>
      </nav>
    </div>
  );
}
