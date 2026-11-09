import { ButtonLink, Notice } from "@/components/ui";
import { ClientSearch } from "@/components/client-search";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ClientSummary } from "@/lib/types";

export default async function ClientsPage() {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, display_name, phone_e164")
    .eq("tenant_id", membership.tenantId)
    .is("archived_at", null)
    .order("display_name")
    .limit(500);

  const clients: ClientSummary[] = (data ?? []).map((row) => ({
    id: row.id as string,
    displayName: row.display_name as string,
    phoneE164: (row.phone_e164 as string | null) ?? null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.clients}</h1>
        <ButtonLink href="/clients/new" className="shrink-0 whitespace-nowrap">
          {messages.addClient}
        </ButtonLink>
      </div>
      {error ? (
        <Notice>{messages.clientsUnavailable}</Notice>
      ) : (
        <ClientSearch clients={clients} messages={messages} canBook={canBook(membership.role)} />
      )}
    </div>
  );
}
