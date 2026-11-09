import { PlusIcon } from "@/components/app-icons";
import { OrderSearch } from "@/components/order-search";
import { ButtonLink, Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { heldDays, isOrderStatus } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, OrderSummary } from "@/lib/types";

interface ClientJoin {
  id: string;
  display_name: string;
}

function joinedClient(value: ClientJoin | ClientJoin[] | null): ClientJoin | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const clientId = params.clientId?.trim() || null;
  const statusParam = params.status?.trim() || null;
  const statusFilter: OrderStatus | null =
    statusParam && isOrderStatus(statusParam) ? statusParam : null;

  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, status, scheduled_on, created_at, client_id, clients(id, display_name)")
    .eq("tenant_id", membership.tenantId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (clientId) {
    query = query.eq("client_id", clientId);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const [ordersResult, clientsResult] = await Promise.all([
    query,
    supabase
      .from("clients")
      .select("id, display_name")
      .eq("tenant_id", membership.tenantId)
      .is("archived_at", null)
      .order("display_name")
      .limit(500),
  ]);

  const { data, error } = ordersResult;

  const orders: OrderSummary[] = (data ?? []).flatMap((row) => {
    const status = String(row.status ?? "");
    if (!isOrderStatus(status)) return [];

    const client = joinedClient(row.clients as ClientJoin | ClientJoin[] | null);

    return [
      {
        id: row.id as string,
        clientId: (client?.id as string | undefined) ?? (row.client_id as string),
        clientName: client?.display_name ?? "",
        status,
        scheduledOn: (row.scheduled_on as string | null) ?? null,
        heldDays: heldDays(String(row.created_at ?? ""), status),
      },
    ];
  });

  const clients = (clientsResult.data ?? []).map((row) => ({
    id: row.id as string,
    displayName: row.display_name as string,
  }));

  const filteredEmpty =
    Boolean(clientId || statusFilter) && orders.length === 0 && !error;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 flex-1 text-pretty text-3xl font-semibold tracking-tight">
          {messages.orders}
        </h1>
        {canBook(membership.role) ? (
          <ButtonLink
            href={clientId ? `/orders/new?clientId=${clientId}` : "/orders/new"}
            className="shrink-0 gap-1.5 px-3 [&_svg]:size-5"
          >
            <PlusIcon className="size-5" />
            <span className="max-w-[9rem] truncate sm:max-w-none">{messages.addOrder}</span>
          </ButtonLink>
        ) : null}
      </div>
      {error ? (
        <Notice>{messages.ordersUnavailable}</Notice>
      ) : (
        <OrderSearch
          orders={orders}
          messages={messages}
          clients={clients}
          clientId={clientId}
          status={statusFilter}
          emptyLabel={
            filteredEmpty
              ? clientId
                ? messages.noOrdersForClient
                : messages.noMatch
              : messages.noOrders
          }
        />
      )}
    </div>
  );
}
