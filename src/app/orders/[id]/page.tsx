import Link from "next/link";
import { notFound } from "next/navigation";
import { BackIcon, CalendarIcon, NoteIcon, PhoneIcon, PinIcon } from "@/components/app-icons";
import { OrderActions } from "@/components/order-actions";
import { Badge } from "@/components/tailgrids/badge";
import { ButtonLink, ListRow, Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { heldDays, isOrderStatus, orderCode, orderStatusLabel } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

interface ClientJoin {
  id: string;
  display_name: string;
  phone_e164: string | null;
}

interface LineJoin {
  line: string;
}

interface ProductJoin {
  name: string;
}

interface OrderLineJoin {
  qty: number;
  products: ProductJoin | ProductJoin[] | null;
}

function joinedClient(value: ClientJoin | ClientJoin[] | null): ClientJoin | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function joinedLine(value: LineJoin | LineJoin[] | null): string {
  if (!value) return "";
  return Array.isArray(value) ? (value[0]?.line ?? "") : value.line;
}

function statusBadgeColor(status: string): "primary" | "warning" | "success" | "error" {
  if (status === "in_delivery") return "warning";
  if (status === "completed") return "success";
  if (status === "cancelled") return "error";
  return "primary";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, scheduled_on, note, created_at, clients(id, display_name, phone_e164), addresses(line), order_lines(qty, products(name))",
    )
    .eq("id", id)
    .eq("tenant_id", membership.tenantId)
    .maybeSingle();

  if (error) {
    return <Notice>{messages.ordersUnavailable}</Notice>;
  }

  if (!data) notFound();

  const status = String(data.status ?? "");
  if (!isOrderStatus(status)) notFound();

  const client = joinedClient(data.clients as ClientJoin | ClientJoin[] | null);
  const addressLine = joinedLine(data.addresses as LineJoin | LineJoin[] | null);
  const lineRaw = data.order_lines as OrderLineJoin | OrderLineJoin[] | null;
  const orderLines = !lineRaw ? [] : Array.isArray(lineRaw) ? lineRaw : [lineRaw];
  const productRows = orderLines.map((row, index) => {
    const product = row.products
      ? Array.isArray(row.products)
        ? row.products[0]
        : row.products
      : null;

    return {
      key: `${product?.name ?? "line"}-${index}`,
      name: product?.name ?? "",
      qty: Number(row.qty),
    };
  }).filter((row) => row.name);
  const counts = new Intl.NumberFormat(membership.locale === "ru" ? "ru" : "ky");
  const dateFormat = new Intl.DateTimeFormat(membership.locale === "ru" ? "ru" : "ky", {
    dateStyle: "medium",
  });

  const days = heldDays(String(data.created_at ?? ""), status);
  const open = status === "open" || status === "in_delivery";
  const phone = client?.phone_e164 ?? null;
  const clientName = client?.display_name ?? messages.orders;
  const clientId = client?.id ?? null;
  const bookingAllowed = canBook(membership.role);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <Link
          href="/orders"
          className="inline-flex min-h-12 shrink-0 items-center gap-1 text-sm font-semibold text-stamp"
        >
          <BackIcon />
          <span className="sr-only">{messages.back}</span>
        </Link>
        <header className="min-w-0 flex-1 pt-1.5">
          {clientId ? (
            <Link href={`/clients/${clientId}`} className="block min-w-0">
              <h1 className="text-pretty text-2xl font-semibold tracking-tight leading-tight">
                {clientName}
              </h1>
            </Link>
          ) : (
            <h1 className="text-pretty text-2xl font-semibold tracking-tight leading-tight">
              {clientName}
            </h1>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="tabular-nums text-sm font-semibold text-mute">#{orderCode(id)}</span>
            <Badge color={statusBadgeColor(status)}>{orderStatusLabel(status, messages)}</Badge>
            {days === null ? null : (
              <span className="text-sm text-mute">
                {days} {messages.holding}
              </span>
            )}
          </div>
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
        {clientId ? (
          <Link
            href={`/clients/${clientId}`}
            className="choice flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold text-stamp"
          >
            {messages.clientCard}
          </Link>
        ) : null}
      </div>

      <ul className="overflow-hidden rounded-lg border border-line">
        {addressLine ? (
          <ListRow ruled>
            <div className="flex min-h-12 items-start gap-2 py-2">
              <PinIcon className="mt-0.5 size-3.5 text-mute" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-mute">{messages.orderAddress}</p>
                <p className="break-words text-sm font-semibold leading-snug">{addressLine}</p>
              </div>
            </div>
          </ListRow>
        ) : null}
        {productRows.map((row, index) => (
          <ListRow key={row.key} ruled>
            <div className="flex min-h-12 items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                {index === 0 ? (
                  <p className="text-xs font-semibold text-mute">{messages.orderLines}</p>
                ) : null}
                <p className="truncate text-sm font-semibold">{row.name}</p>
              </div>
              <p className="shrink-0 tabular-nums text-sm font-semibold">
                {counts.format(row.qty)}
              </p>
            </div>
          </ListRow>
        ))}
        {data.scheduled_on ? (
          <ListRow ruled>
            <div className="flex min-h-12 items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-2 text-sm text-mute">
                <CalendarIcon className="size-3.5" />
                {messages.scheduled}
              </span>
              <span className="tabular-nums text-sm font-semibold">
                {dateFormat.format(new Date(`${String(data.scheduled_on)}T12:00:00`))}
              </span>
            </div>
          </ListRow>
        ) : null}
        {data.note ? (
          <ListRow ruled>
            <div className="flex min-h-12 items-start gap-2 py-2">
              <NoteIcon className="mt-0.5 size-3.5 text-mute" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-mute">{messages.notes}</p>
                <p className="break-words text-sm leading-snug">{String(data.note)}</p>
              </div>
            </div>
          </ListRow>
        ) : null}
      </ul>

      {open && bookingAllowed ? <OrderActions orderId={id} messages={messages} /> : null}
    </div>
  );
}
