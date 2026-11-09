import { ButtonLink, Notice } from "@/components/ui";
import { ProductSearch } from "@/components/product-search";
import { messagesFor } from "@/i18n/messages";
import { requireMembership } from "@/lib/auth";
import { freeQty, heldByProduct, type HeldRow } from "@/lib/stock";
import { createClient } from "@/lib/supabase/server";
import type { ProductSummary } from "@/lib/types";

interface BalanceRow {
  qty: number;
}

export default async function ProductsPage() {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  const [productsResult, heldResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, stock_balances(qty)")
      .eq("tenant_id", membership.tenantId)
      .eq("active", true)
      .order("name")
      .limit(500),
    supabase
      .from("order_lines")
      .select("product_id, qty, orders(status)")
      .eq("tenant_id", membership.tenantId),
  ]);

  const held = heldByProduct((heldResult.data ?? []) as HeldRow[]);
  const products: ProductSummary[] = (productsResult.data ?? []).map((row) => {
    const balance = row.stock_balances as BalanceRow | BalanceRow[] | null;
    const onHand = Array.isArray(balance) ? (balance[0]?.qty ?? 0) : (balance?.qty ?? 0);
    const productId = row.id as string;

    return {
      id: productId,
      name: row.name as string,
      available: freeQty(onHand, held.get(productId) ?? 0),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.products}</h1>
        {membership.role === "owner" ? (
          <ButtonLink href="/products/new" className="shrink-0 whitespace-nowrap">
            {messages.addProduct}
          </ButtonLink>
        ) : null}
      </div>
      {productsResult.error ? (
        <Notice>{messages.catalogUnavailable}</Notice>
      ) : (
        <ProductSearch products={products} messages={messages} locale={membership.locale} />
      )}
    </div>
  );
}
