import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderActions } from "@/components/order-actions";
import { ListRow, Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { heldDays, isOrderStatus, orderStatusLabel } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

interface NameJoin {
  display_name: string;
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

function joinedName(value: NameJoin | NameJoin[] | null): string {
  if (!value) return "";
  return Array.isArray(value) ? (value[0]?.display_name ?? "") : value.display_name;
}

function joinedLine(value: LineJoin | LineJoin[] | null): string {
  if (!value) return "";
  return Array.isArray(value) ? (value[0]?.line ?? "") : value.line;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, scheduled_on, note, created_at, clients(display_name), addresses(line), order_lines(qty, products(name))",
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

  const lineRaw = data.order_lines as OrderLineJoin | OrderLineJoin[] | null;
  const line = lineRaw ? (Array.isArray(lineRaw) ? lineRaw[0] : lineRaw) : null;
  const product = line?.products
    ? Array.isArray(line.products)
      ? line.products[0]
      : line.products
    : null;
  const counts = new Intl.NumberFormat(membership.locale === "ru" ? "ru" : "ky");

  const days = heldDays(String(data.created_at ?? ""), status);
  const statusText = [
    orderStatusLabel(status, messages),
    days === null ? null : `${days} ${messages.holding}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const facts = [
    { label: messages.orderClient, value: joinedName(data.clients as NameJoin | NameJoin[] | null) },
    { label: messages.orderAddress, value: joinedLine(data.addresses as LineJoin | LineJoin[] | null) },
    product?.name ? { label: messages.orderProduct, value: product.name } : null,
    line ? { label: messages.orderAmount, value: counts.format(Number(line.qty)) } : null,
    { label: messages.orderStatus, value: statusText },
    data.scheduled_on ? { label: messages.scheduled, value: String(data.scheduled_on) } : null,
    data.note ? { label: messages.notes, value: String(data.note) } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null && fact.value.length > 0);

  const open = status === "open" || status === "in_delivery";

  return (
    <div className="flex flex-col gap-4">
      <Link href="/orders" className="inline-flex min-h-12 items-center text-sm font-semibold text-stamp">
        {messages.back}
      </Link>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.orders}</h1>
      <ul className="overflow-hidden rounded-lg border border-line bg-white">
        {facts.map((fact) => (
          <ListRow key={fact.label} ruled>
            <div className="flex min-h-12 items-center justify-between gap-3 py-2">
              <span className="text-sm text-mute">{fact.label}</span>
              <span className="text-right font-semibold">{fact.value}</span>
            </div>
          </ListRow>
        ))}
      </ul>
      {open && canBook(membership.role) ? <OrderActions orderId={id} messages={messages} /> : null}
    </div>
  );
}
