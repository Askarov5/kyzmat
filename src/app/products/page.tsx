import { PlusIcon } from "@/components/app-icons";
import { ProductSearch } from "@/components/product-search";
import { ButtonLink, Notice } from "@/components/ui";
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
    const reserved = held.get(productId) ?? 0;

    return {
      id: productId,
      name: row.name as string,
      onHand,
      reserved,
      available: freeQty(onHand, reserved),
    };
  });

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 flex-1 text-pretty text-3xl font-semibold tracking-tight">
          {messages.products}
        </h1>
        {membership.role === "owner" ? (
          <ButtonLink
            href="/products/new"
            className="shrink-0 gap-1.5 px-3 [&_svg]:size-5"
          >
            <PlusIcon className="size-5" />
            <span className="max-w-[9rem] truncate sm:max-w-none">{messages.addProduct}</span>
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
