import { PlusIcon } from "@/components/app-icons";
import { ClientSearch } from "@/components/client-search";
import { ButtonLink, Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { placeLineFromLocalityKy } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";
import type { ClientSummary } from "@/lib/types";

interface LocalityJoin {
  name_ky: string;
  name_ru: string;
}

interface AddressJoin {
  id: string;
  created_at: string;
  localities: LocalityJoin | LocalityJoin[] | null;
}

function firstLocalityKy(addresses: AddressJoin[] | AddressJoin | null): string | null {
  const list = !addresses ? [] : Array.isArray(addresses) ? addresses : [addresses];
  if (list.length === 0) {
    return null;
  }

  const sorted = [...list].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  const locality = sorted[0]?.localities;
  const place = Array.isArray(locality) ? locality[0] : locality;
  return place?.name_ky ?? null;
}

export default async function ClientsPage() {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, display_name, phone_e164, addresses(id, created_at, localities(name_ky, name_ru))")
    .eq("tenant_id", membership.tenantId)
    .is("archived_at", null)
    .order("display_name")
    .limit(500);

  const clients: ClientSummary[] = (data ?? []).map((row) => {
    const localityKy = firstLocalityKy(row.addresses as AddressJoin[] | AddressJoin | null);

    return {
      id: row.id as string,
      displayName: row.display_name as string,
      phoneE164: (row.phone_e164 as string | null) ?? null,
      placeLine: localityKy ? placeLineFromLocalityKy(localityKy, membership.locale) : null,
    };
  });

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 flex-1 text-pretty text-3xl font-semibold tracking-tight">
          {messages.clients}
        </h1>
        <ButtonLink
          href="/clients/new"
          className="shrink-0 gap-1.5 px-3 [&_svg]:size-5"
        >
          <PlusIcon className="size-5" />
          <span className="max-w-[9rem] truncate sm:max-w-none">{messages.addClient}</span>
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
