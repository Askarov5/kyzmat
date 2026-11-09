import { redirect } from "next/navigation";
import { OrderForm } from "@/components/order-form";
import { ButtonLink, Notice } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { canBook, requireMembership } from "@/lib/auth";
import { freeQty, heldByProduct, type HeldRow } from "@/lib/stock";
import { createClient } from "@/lib/supabase/server";

interface AddressJoin {
  id: string;
  line: string;
}

interface BalanceRow {
  qty: number;
}

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);

  if (!canBook(membership.role)) {
    redirect("/orders");
  }

  const params = await searchParams;
  const initialClientId = String(params.clientId ?? "");
  const supabase = await createClient();

  const [clientsResult, productsResult, heldResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, display_name, addresses(id, line)")
      .eq("tenant_id", membership.tenantId)
      .is("archived_at", null)
      .order("display_name")
      .limit(500),
    supabase
      .from("products")
      .select("id, name, price_som, stock_balances(qty)")
      .eq("tenant_id", membership.tenantId)
      .eq("active", true)
      .order("name")
      .limit(500),
    supabase
      .from("order_lines")
      .select("product_id, qty, orders(status)")
      .eq("tenant_id", membership.tenantId),
  ]);

  const clients = (clientsResult.data ?? []).map((row) => ({
    id: row.id as string,
    name: row.display_name as string,
  }));
  const addresses = (clientsResult.data ?? []).flatMap((row) => {
    const joined = row.addresses as AddressJoin | AddressJoin[] | null;
    const rows = joined ? (Array.isArray(joined) ? joined : [joined]) : [];
    return rows.map((address) => ({
      id: address.id,
      clientId: row.id as string,
      line: address.line,
    }));
  });

  const held = heldByProduct((heldResult.data ?? []) as HeldRow[]);
  const products = (productsResult.data ?? []).map((row) => {
    const balance = row.stock_balances as BalanceRow | BalanceRow[] | null;
    const onHand = Array.isArray(balance) ? (balance[0]?.qty ?? 0) : (balance?.qty ?? 0);
    const productId = row.id as string;
    const reserved = held.get(productId) ?? 0;
    return {
      id: productId,
      name: row.name as string,
      priceSom: Number(row.price_som ?? 0),
      onHand,
      reserved,
      available: freeQty(onHand, reserved),
    };
  });

  const knownClient =
    !initialClientId || clients.some((client) => client.id === initialClientId)
      ? initialClientId
      : "";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.addOrder}</h1>
      {clientsResult.error || productsResult.error ? (
        <Notice>{messages.ordersUnavailable}</Notice>
      ) : clients.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="py-4 text-mute">{messages.noClients}</p>
          <ButtonLink href="/clients/new">{messages.addClient}</ButtonLink>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="py-4 text-mute">{messages.noProducts}</p>
          {membership.role === "owner" ? (
            <ButtonLink href="/products/new">{messages.addProduct}</ButtonLink>
          ) : null}
        </div>
      ) : (
        <OrderForm
          clients={clients}
          addresses={addresses}
          products={products}
          messages={messages}
          locale={membership.locale}
          initialClientId={knownClient}
        />
      )}
    </div>
  );
}
