"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ButtonLink, Field, ListRow } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { ClientSummary } from "@/lib/types";
import { phoneDigits } from "@/lib/phone";

interface ClientSearchProps {
  clients: ClientSummary[];
  messages: Messages;
  canBook: boolean;
}

export function ClientSearch({ clients, messages, canBook }: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const digits = phoneDigits(query);

  const filtered = useMemo(() => {
    if (!needle) {
      return clients;
    }

    return clients.filter((client) => {
      const name = client.displayName.toLowerCase();
      const phone = client.phoneE164 ? phoneDigits(client.phoneE164) : "";
      return name.includes(needle) || (digits.length > 0 && phone.includes(digits));
    });
  }, [clients, digits, needle]);

  const showAdd = needle.length > 0 && filtered.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold" htmlFor="client-search">
        {messages.searchClient}
      </label>
      <Field
        id="client-search"
        value={query}
        role="combobox"
        aria-expanded="true"
        aria-controls="client-results"
        aria-autocomplete="list"
        autoComplete="off"
        inputMode="search"
        onChange={(event) => setQuery(event.target.value)}
        className="text-lg"
      />
      <ul id="client-results" className="overflow-hidden rounded-lg border border-line bg-white">
        {filtered.map((client) => (
          <ListRow key={client.id} ruled>
            <div className="flex min-h-12 items-center gap-2 py-2">
              <Link href={`/clients/${client.id}`} className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="text-base font-semibold">{client.displayName}</span>
                {client.phoneE164 ? (
                  <span className="text-sm tabular-nums text-mute">{client.phoneE164}</span>
                ) : null}
              </Link>
              {canBook ? (
                <ButtonLink
                  href={`/orders/new?clientId=${client.id}`}
                  className="shrink-0 whitespace-nowrap px-3"
                >
                  {messages.addOrder}
                </ButtonLink>
              ) : null}
            </div>
          </ListRow>
        ))}
        {clients.length === 0 ? (
          <li className="py-4 text-mute">{messages.noClients}</li>
        ) : null}
        {showAdd ? (
          <li>
            <ButtonLink href={`/clients/new?name=${encodeURIComponent(query.trim())}`}>
              {messages.addClient}
            </ButtonLink>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
