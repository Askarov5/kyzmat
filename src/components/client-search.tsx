"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Messages } from "@/i18n/types";
import type { ClientSummary } from "@/lib/types";
import { phoneDigits } from "@/lib/phone";

interface ClientSearchProps {
  clients: ClientSummary[];
  messages: Messages;
}

export function ClientSearch({ clients, messages }: ClientSearchProps) {
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
      <input
        id="client-search"
        value={query}
        role="combobox"
        aria-expanded="true"
        aria-controls="client-results"
        aria-autocomplete="list"
        autoComplete="off"
        inputMode="search"
        onChange={(event) => setQuery(event.target.value)}
        className="field text-lg"
      />
      <ul id="client-results" className="flex flex-col">
        {filtered.map((client) => (
          <li key={client.id} className="list-row border-b border-line">
            <Link
              href={`/clients/${client.id}`}
              className="flex min-h-12 flex-col justify-center py-2"
            >
              <span className="text-base font-semibold">{client.displayName}</span>
              {client.phoneE164 ? (
                <span className="text-sm tabular-nums text-ink/70">{client.phoneE164}</span>
              ) : null}
            </Link>
          </li>
        ))}
        {clients.length === 0 ? (
          <li className="py-4 text-ink/70">{messages.noClients}</li>
        ) : null}
        {showAdd ? (
          <li>
            <Link
              href={`/clients/new?name=${encodeURIComponent(query.trim())}`}
              className="primary inline-flex items-center"
            >
              {messages.addClient}
            </Link>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
