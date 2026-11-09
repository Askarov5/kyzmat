import Link from "next/link";
import { notFound } from "next/navigation";
import { BackIcon } from "@/components/app-icons";
import { CorrectStock } from "@/components/correct-stock";
import { ReceiveStock } from "@/components/receive-stock";
import { StockFigures } from "@/components/stock-figures";
import { ListRow } from "@/components/ui";
import { messagesFor } from "@/i18n/messages";
import { intervalTitle, unitTitle } from "@/lib/catalog";
import { canManagePile, requireMembership } from "@/lib/auth";
import { freeQty, heldByProduct, type HeldRow } from "@/lib/stock";
import { createClient } from "@/lib/supabase/server";

interface BalanceRow {
  qty: number;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  const [productResult, heldResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, description, sku, price_som, unit, maintenance_days, reorder_days, active, stock_balances(qty)",
      )
      .eq("id", id)
      .eq("tenant_id", membership.tenantId)
      .maybeSingle(),
    supabase
      .from("order_lines")
      .select("product_id, qty, orders(status)")
      .eq("tenant_id", membership.tenantId)
      .eq("product_id", id),
  ]);

  const data = productResult.data;

  if (!data || !data.active) {
    notFound();
  }

  const balance = data.stock_balances as BalanceRow | BalanceRow[] | null;
  const onHand = Array.isArray(balance) ? (balance[0]?.qty ?? 0) : (balance?.qty ?? 0);
  const held = heldByProduct((heldResult.data ?? []) as HeldRow[]).get(id) ?? 0;
  const available = freeQty(onHand, held);
  const counts = new Intl.NumberFormat(membership.locale === "ru" ? "ru" : "ky");
  const description = data.description as string | null;
  const sku = data.sku as string | null;
  const unit = data.unit as string | null;
  const maintenance = intervalTitle(Number(data.maintenance_days), membership.locale);
  const reorder = intervalTitle(Number(data.reorder_days), membership.locale);
  const priceSom = Number(data.price_som ?? 0);
  const details = [
    {
      label: messages.price,
      value: `${counts.format(priceSom)} ${messages.som}`,
    },
    sku ? { label: messages.sku, value: sku } : null,
    unit ? { label: messages.unit, value: unitTitle(unit, membership.locale) } : null,
    maintenance ? { label: messages.maintenanceInterval, value: maintenance } : null,
    reorder ? { label: messages.reorderInterval, value: reorder } : null,
  ].filter((detail): detail is { label: string; value: string } => detail !== null);
  const pileAllowed = canManagePile(membership.role);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <Link
          href="/products"
          className="inline-flex min-h-12 shrink-0 items-center gap-1 text-sm font-semibold text-stamp"
        >
          <BackIcon />
          <span className="sr-only">{messages.back}</span>
        </Link>
        <header className="min-w-0 flex-1 pt-1.5">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight leading-tight">
            {data.name as string}
          </h1>
          {description ? (
            <p className="mt-1 break-words text-sm leading-snug text-mute">{description}</p>
          ) : null}
        </header>
      </div>

      <StockFigures
        onHand={onHand}
        reserved={held}
        available={available}
        messages={messages}
        format={counts.format.bind(counts)}
        size="card"
      />

      {details.length > 0 ? (
        <ul className="overflow-hidden rounded-lg border border-line">
          {details.map((detail) => (
            <ListRow key={detail.label} ruled>
              <div className="flex min-h-12 items-center justify-between gap-3 py-2">
                <span className="text-sm text-mute">{detail.label}</span>
                <span className="text-right text-sm font-semibold break-words">{detail.value}</span>
              </div>
            </ListRow>
          ))}
        </ul>
      ) : null}

      {pileAllowed ? (
        <section className="flex flex-col gap-3">
          <h2 className="border-b border-line pb-2 text-base font-semibold">{messages.receive}</h2>
          <ReceiveStock productId={id} messages={messages} />
          <CorrectStock productId={id} messages={messages} />
        </section>
      ) : null}
    </div>
  );
}
