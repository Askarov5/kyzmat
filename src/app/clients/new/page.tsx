import Link from "next/link";
import { ClientForm } from "@/components/client-form";
import { messagesFor } from "@/i18n/messages";
import { requireMembership } from "@/lib/auth";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/clients" className="inline-flex min-h-12 items-center text-sm font-semibold text-stamp">
        {messages.back}
      </Link>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.addClient}</h1>
      <ClientForm messages={messages} initialName={params.name ?? ""} locale={membership.locale} />
    </div>
  );
}
