import { Badge } from "@/components/tailgrids/badge";
import { ButtonLink, ListRow, Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { heldDays, isOrderStatus, orderStatusLabel } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import type { OrderSummary } from "@/lib/types";
import Link from "next/link";

interface ClientJoin {
  display_name: string;
}

function joinedName(value: ClientJoin | ClientJoin[] | null): string {
  if (!value) return "";
  return Array.isArray(value) ? (value[0]?.display_name ?? "") : value.display_name;
}

export default async function OrdersPage() {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, scheduled_on, created_at, clients(display_name)")
    .eq("tenant_id", membership.tenantId)
    .order("created_at", { ascending: false })
    .limit(500);

  const orders: OrderSummary[] = (data ?? []).flatMap((row) => {
    const status = String(row.status ?? "");
    if (!isOrderStatus(status)) return [];

    return [
      {
        id: row.id as string,
        clientName: joinedName(row.clients as ClientJoin | ClientJoin[] | null),
        status,
        scheduledOn: (row.scheduled_on as string | null) ?? null,
        heldDays: heldDays(String(row.created_at ?? ""), status),
      },
    ];
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.orders}</h1>
        {canBook(membership.role) ? (
          <ButtonLink href="/orders/new" className="shrink-0 whitespace-nowrap">
            {messages.addOrder}
          </ButtonLink>
        ) : null}
      </div>
      {error ? (
        <Notice>{messages.ordersUnavailable}</Notice>
      ) : orders.length === 0 ? (
        <p className="py-4 text-mute">{messages.noOrders}</p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-line bg-white">
          {orders.map((order) => {
            const detail = [
              order.scheduledOn,
              order.heldDays === null ? null : `${order.heldDays} ${messages.holding}`,
            ]
              .filter(Boolean)
              .join(" · ");
            const color =
              order.status === "in_delivery"
                ? "warning"
                : order.status === "completed"
                  ? "success"
                  : order.status === "cancelled"
                    ? "error"
                    : "primary";

            return (
              <ListRow key={order.id} ruled>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex min-h-12 flex-col justify-center gap-1 py-2"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{order.clientName}</span>
                    <Badge color={color}>{orderStatusLabel(order.status, messages)}</Badge>
                  </span>
                  {detail ? <span className="text-sm text-mute">{detail}</span> : null}
                </Link>
              </ListRow>
            );
          })}
        </ul>
      )}
    </div>
  );
}
