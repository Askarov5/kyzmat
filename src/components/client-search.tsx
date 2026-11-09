"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { OrderIcon, PhoneIcon, PinIcon, SearchIcon, WhatsAppIcon } from "@/components/app-icons";
import { ButtonLink, Field } from "@/components/ui";
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

  const filtering = needle.length > 0;
  const showMiss = filtering && filtered.length === 0 && clients.length > 0;
  const showEmpty = clients.length === 0;

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="relative w-full min-w-0">
        <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-mute">
          <SearchIcon />
        </span>
        <Field
          id="client-search"
          value={query}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          inputMode="search"
          spellCheck={false}
          placeholder={messages.searchClient}
          aria-label={messages.search}
          aria-controls="client-results"
          onChange={(event) => setQuery(event.target.value)}
          className="block w-full min-w-0 pl-10 pr-12"
        />
        {query ? (
          <button
            type="button"
            className="absolute inset-y-0 right-1 my-auto flex size-10 min-h-10 items-center justify-center rounded-lg text-xl leading-none text-mute"
            aria-label={messages.clear}
            onClick={() => setQuery("")}
          >
            ×
          </button>
        ) : null}
      </div>

      <ul id="client-results" className="flex w-full min-w-0 flex-col gap-3">
        {filtered.map((client) => (
          <li
            key={client.id}
            className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_1px_3px_rgba(16,24,40,0.12)]"
          >
            <div className="flex min-h-14 w-full flex-nowrap items-stretch">
              {canBook ? (
                <Link
                  href={`/orders/new?clientId=${client.id}`}
                  className="flex w-12 shrink-0 items-center justify-center border-r border-line bg-field text-stamp touch-manipulation transition-[background-color,transform] duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-row"
                  aria-label={messages.addOrder}
                >
                  <OrderIcon className="size-5" />
                </Link>
              ) : null}
              <Link
                href={`/clients/${client.id}`}
                className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2.5 touch-manipulation [@media(hover:hover)]:hover:bg-row"
              >
                <span className="break-words text-base font-semibold leading-snug">
                  {client.displayName}
                </span>
                {client.placeLine ? (
                  <span className="flex min-w-0 items-center gap-1 text-sm text-mute">
                    <PinIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{client.placeLine}</span>
                  </span>
                ) : null}
              </Link>
              {client.phoneE164 ? (
                <>
                  <a
                    href={`https://wa.me/${phoneDigits(client.phoneE164)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-12 shrink-0 items-center justify-center border-l border-line bg-field text-stamp touch-manipulation transition-[background-color,transform] duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-row"
                    aria-label={`${messages.whatsapp} ${client.phoneE164}`}
                  >
                    <WhatsAppIcon className="size-5" />
                  </a>
                  <a
                    href={`tel:${client.phoneE164}`}
                    className="flex w-12 shrink-0 items-center justify-center border-l border-line bg-field text-stamp touch-manipulation transition-[background-color,transform] duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-row"
                    aria-label={`${messages.call} ${client.phoneE164}`}
                  >
                    <PhoneIcon className="size-5" />
                  </a>
                </>
              ) : null}
            </div>
          </li>
        ))}

        {showEmpty ? (
          <li className="rounded-lg border border-line bg-sheet px-3 py-4 text-sm text-mute shadow-sm">
            {messages.noClients}
          </li>
        ) : null}

        {showMiss ? (
          <li className="flex flex-col gap-3 rounded-lg border border-line bg-sheet p-3 shadow-sm">
            <p className="text-sm text-mute">{messages.noMatch}</p>
            <ButtonLink
              href={`/clients/new?name=${encodeURIComponent(query.trim())}`}
              className="w-full justify-center"
            >
              {messages.addClient}
            </ButtonLink>
          </li>
        ) : null}

        {showEmpty ? (
          <li>
            <ButtonLink href="/clients/new" className="w-full justify-center">
              {messages.addClient}
            </ButtonLink>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
