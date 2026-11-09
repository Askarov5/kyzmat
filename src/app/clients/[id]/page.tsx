import Link from "next/link";
import { notFound } from "next/navigation";
import { AddressForm } from "@/components/address-form";
import { ArchiveControl } from "@/components/archive-control";
import { BackIcon, CalendarIcon, NoteIcon, OrderIcon, PhoneIcon, PinIcon } from "@/components/app-icons";
import { Disclose, DisclosePanel, DiscloseTrigger } from "@/components/disclose";
import { NoteForm } from "@/components/note-form";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink, ListRow } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AddressRecord, NotePhraseOption, NoteRecord, ServiceDate } from "@/lib/types";

interface ProductJoin {
  name: string;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  const [clientResult, addressResult, noteResult, phraseResult, serviceResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, display_name, phone_e164, archived_at")
      .eq("id", id)
      .eq("tenant_id", membership.tenantId)
      .maybeSingle(),
    supabase
      .from("addresses")
      .select("id, line, localities(name_ky, name_ru)")
      .eq("client_id", id)
      .eq("tenant_id", membership.tenantId)
      .order("created_at"),
    supabase
      .from("client_notes")
      .select("id, body, created_at")
      .eq("client_id", id)
      .eq("tenant_id", membership.tenantId)
      .order("created_at", { ascending: false }),
    supabase
      .from("note_phrases")
      .select("id, body, use_count")
      .eq("tenant_id", membership.tenantId)
      .order("use_count", { ascending: false }),
    supabase
      .from("client_service")
      .select("product_id, next_on, products(name)")
      .eq("client_id", id)
      .eq("tenant_id", membership.tenantId)
      .order("next_on"),
  ]);

  const client = clientResult.data;

  if (!client || client.archived_at) {
    notFound();
  }

  const addresses: AddressRecord[] = (addressResult.data ?? []).map((row) => {
    const locality = row.localities as
      | { name_ky: string; name_ru: string }
      | { name_ky: string; name_ru: string }[]
      | null;
    const place = Array.isArray(locality) ? locality[0] : locality;

    return {
      id: row.id as string,
      line: row.line as string,
      localityKy: place?.name_ky ?? "",
      localityRu: place?.name_ru ?? "",
    };
  });

  const notes: NoteRecord[] = (noteResult.data ?? []).map((row) => ({
    id: row.id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  }));

  const phrases: NotePhraseOption[] = (phraseResult.data ?? []).map((row) => ({
    id: row.id as string,
    body: row.body as string,
    useCount: row.use_count as number,
  }));

  const services: ServiceDate[] = (serviceResult.data ?? []).map((row) => {
    const product = row.products as ProductJoin | ProductJoin[] | null;
    const name = Array.isArray(product) ? product[0]?.name : product?.name;
    return {
      productId: row.product_id as string,
      productName: name ?? "",
      nextOn: row.next_on as string,
    };
  });

  const phone = client.phone_e164 as string | null;
  const dateFormat = new Intl.DateTimeFormat(membership.locale === "ru" ? "ru" : "ky", {
    dateStyle: "medium",
  });
  const bookingAllowed = canBook(membership.role);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <Link
          href="/clients"
          className="inline-flex min-h-12 shrink-0 items-center gap-1 text-sm font-semibold text-stamp"
        >
          <BackIcon />
          <span className="sr-only">{messages.back}</span>
        </Link>
        <header className="min-w-0 flex-1 pt-1.5">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight leading-tight">
            {client.display_name as string}
          </h1>
        </header>
      </div>

      <div className="flex flex-col gap-2">
        {phone ? (
          <ButtonLink href={`tel:${phone}`} className="w-full justify-center gap-2">
            <PhoneIcon className="size-4" />
            {messages.call}
            <span className="tabular-nums opacity-90">{phone}</span>
          </ButtonLink>
        ) : null}
        {bookingAllowed ? (
          <Link
            href={`/orders/new?clientId=${id}`}
            className="choice flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold text-stamp"
          >
            <OrderIcon />
            {messages.addOrder}
          </Link>
        ) : null}
        <Link
          href={`/orders?clientId=${id}`}
          className="choice flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold text-stamp"
        >
          <OrderIcon />
          {messages.clientOrders}
        </Link>
      </div>

      {services.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <SectionHeading icon={<CalendarIcon />}>{messages.serviceDates}</SectionHeading>
          <ul className="overflow-hidden rounded-lg border border-line">
            {services.map((service, index) => (
              <ListRow key={service.productId} ruled>
                <div className="flex min-h-11 items-center justify-between gap-3 py-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{service.productName}</p>
                    {index === 0 ? (
                      <p className="text-xs text-mute">{messages.nextService}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 tabular-nums text-sm font-semibold">
                    {dateFormat.format(new Date(`${service.nextOn}T12:00:00`))}
                  </p>
                </div>
              </ListRow>
            ))}
          </ul>
        </section>
      ) : null}

      <Disclose defaultOpen={addresses.length === 0}>
        <section className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <h2 className="flex min-h-10 min-w-0 flex-1 items-center gap-2 text-base font-semibold">
              <span className="text-mute">
                <PinIcon />
              </span>
              {messages.addresses}
            </h2>
            <DiscloseTrigger label={messages.addAddress} />
          </div>
          {addresses.length === 0 ? (
            <p className="text-sm text-mute">{messages.emptyAddresses}</p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-line">
              {addresses.map((address) => (
                <li key={address.id} className="flex gap-2 border-b border-line px-3 py-2 last:border-b-0">
                  <PinIcon className="mt-0.5 size-3.5 text-mute" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {membership.locale === "ru" ? address.localityRu : address.localityKy}
                    </p>
                    <p className="break-words text-sm leading-snug text-mute">{address.line}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <DisclosePanel title={messages.addAddress} cancelLabel={messages.cancel}>
            <AddressForm clientId={id} locale={membership.locale} messages={messages} />
          </DisclosePanel>
        </section>
      </Disclose>

      <Disclose>
        <section className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <h2 className="flex min-h-10 min-w-0 flex-1 items-center gap-2 text-base font-semibold">
              <span className="text-mute">
                <NoteIcon />
              </span>
              {messages.notes}
            </h2>
            <DiscloseTrigger label={messages.addNote} />
          </div>
          {notes.length === 0 ? (
            <p className="text-sm text-mute">{messages.emptyNotes}</p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-line">
              {notes.map((note) => (
                <li key={note.id} className="flex gap-2 border-b border-line px-3 py-2 last:border-b-0">
                  <NoteIcon className="mt-0.5 size-3.5 text-mute" />
                  <div className="min-w-0">
                    <p className="break-words text-sm leading-snug">{note.body}</p>
                    <p className="mt-0.5 text-xs text-mute">
                      {dateFormat.format(new Date(note.createdAt))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <DisclosePanel title={messages.addNote} cancelLabel={messages.cancel}>
            <NoteForm clientId={id} phrases={phrases} messages={messages} />
          </DisclosePanel>
        </section>
      </Disclose>

      {membership.role === "owner" ? <ArchiveControl clientId={id} messages={messages} /> : null}
    </div>
  );
}
