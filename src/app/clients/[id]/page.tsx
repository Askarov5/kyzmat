import Link from "next/link";
import { notFound } from "next/navigation";
import { AddressForm } from "@/components/address-form";
import { ArchiveControl } from "@/components/archive-control";
import { NoteForm } from "@/components/note-form";
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
    <div className="flex flex-col gap-6">
      <Link href="/clients" className="inline-flex min-h-12 items-center text-sm font-semibold text-stamp">
        {messages.back}
      </Link>
      <header>
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">
          {client.display_name as string}
        </h1>
        {phone ? (
          <ButtonLink href={`tel:${phone}`} className="mt-4 w-full justify-center tabular-nums">
            {messages.call} {phone}
          </ButtonLink>
        ) : null}
        {bookingAllowed ? (
          <ButtonLink href={`/orders/new?clientId=${id}`} className="mt-3 w-full justify-center">
            {messages.addOrder}
          </ButtonLink>
        ) : null}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.serviceDates}</h2>
        {services.length === 0 ? (
          <p className="text-sm text-mute">{messages.emptyService}</p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-line bg-white">
            {services.map((service, index) => (
              <ListRow key={service.productId} ruled>
                <div className="flex min-h-12 items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{service.productName}</p>
                    {index === 0 ? (
                      <p className="text-sm text-mute">{messages.nextService}</p>
                    ) : null}
                  </div>
                  <p className="tabular-nums font-semibold">
                    {dateFormat.format(new Date(`${service.nextOn}T12:00:00`))}
                  </p>
                </div>
              </ListRow>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.addresses}</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-mute">{messages.emptyAddresses}</p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-line bg-white">
            {addresses.map((address) => (
              <li key={address.id} className="border-b border-line py-3">
                <p className="font-semibold">
                  {membership.locale === "ru" ? address.localityRu : address.localityKy}
                </p>
                <p className="break-words">{address.line}</p>
              </li>
            ))}
          </ul>
        )}
        <AddressForm clientId={id} locale={membership.locale} messages={messages} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.notes}</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-mute">{messages.emptyNotes}</p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-line bg-white">
            {notes.map((note) => (
              <li key={note.id} className="border-b border-line py-3">
                <p className="break-words">{note.body}</p>
                <p className="text-sm text-mute">{dateFormat.format(new Date(note.createdAt))}</p>
              </li>
            ))}
          </ul>
        )}
        <NoteForm clientId={id} phrases={phrases} messages={messages} />
      </section>

      {membership.role === "owner" ? <ArchiveControl clientId={id} messages={messages} /> : null}
    </div>
  );
}
