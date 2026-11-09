import Link from "next/link";
import type { ReactNode } from "react";
import { PageFrame } from "@/components/page-frame";
import type { Messages } from "@/i18n/types";
import type { Locale, MemberRole } from "@/lib/types";

interface AppShellProps {
  locale: Locale;
  messages: Messages;
  companyName: string;
  role: MemberRole;
  section: "clients" | "orders" | "products";
  children: ReactNode;
}

const dockItems = [
  { key: "clients", href: "/clients", ready: true },
  { key: "orders", href: "/orders", ready: true },
  { key: "products", href: "/products", ready: true },
  { key: "due", href: "/due", ready: false },
] as const;

function dockLabel(label: string, key: (typeof dockItems)[number]["key"]) {
  const splitAt = key === "orders" || key === "due" ? 8 : 0;
  if (splitAt <= 0 || splitAt >= label.length) return label;
  return (
    <>
      {label.slice(0, splitAt)}
      <wbr />
      {label.slice(splitAt)}
    </>
  );
}

export function AppShell({ locale, messages, companyName, role, section, children }: AppShellProps) {
  const companyHref = role === "owner" ? "/company" : undefined;
  const dock = (
    <nav className="dock pointer-events-none fixed inset-x-0 bottom-0" aria-label={messages.sections}>
      <div className="pointer-events-auto mx-auto max-w-md border-t border-line bg-sheet pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 gap-1 px-1 py-1">
          {dockItems.map((item) =>
            item.ready ? (
              <Link
                key={item.key}
                href={item.href}
                className={`nav-item flex items-center justify-center px-0.5 text-center text-sm font-semibold leading-tight ${
                  section === item.key ? "text-stamp" : "text-ink"
                }`}
                aria-current={section === item.key ? "page" : undefined}
              >
                {dockLabel(messages[item.key], item.key)}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className="nav-item flex items-center justify-center px-0.5 text-center text-sm font-semibold leading-tight text-mute"
                disabled
              >
                {dockLabel(messages[item.key], item.key)}
                <span className="sr-only">{messages.sectionClosed}</span>
              </button>
            ),
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <PageFrame
      locale={locale}
      messages={messages}
      companyName={companyName}
      companyHref={companyHref}
      showSignOut
      dock={dock}
    >
      {children}
    </PageFrame>
  );
}
