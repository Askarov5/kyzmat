import { AppShell } from "@/components/app-shell";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import { requireMembership } from "@/lib/auth";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const membership = await requireMembership();
  const locale = membership.locale || (await getLocale());
  const messages = messagesFor(locale);

  return (
    <AppShell
      locale={locale}
      messages={messages}
      companyName={membership.tenantName}
      role={membership.role}
      section="products"
    >
      {children}
    </AppShell>
  );
}
