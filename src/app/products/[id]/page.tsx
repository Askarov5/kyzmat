import Link from "next/link";
import { notFound } from "next/navigation";
import { CorrectStock } from "@/components/correct-stock";
import { ReceiveStock } from "@/components/receive-stock";
import { messagesFor } from "@/i18n/messages";
import { intervalTitle, unitTitle } from "@/lib/catalog";
import { canManagePile, requireMembership } from "@/lib/auth";
import { freeQty, heldByProduct, type HeldRow } from "@/lib/stock";
import { createClient } from "@/lib/supabase/server";

interface BalanceRow {
  qty: number;
}

const figures = ["onHand", "reserved", "available"] as const;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();

  const [productResult, heldResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, description, sku, unit, maintenance_days, reorder_days, active, stock_balances(qty)")
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
  const values = {
    onHand: counts.format(onHand),
    reserved: counts.format(held),
    available: counts.format(available),
  };
  const description = data.description as string | null;
  const sku = data.sku as string | null;
  const unit = data.unit as string | null;
  const maintenance = intervalTitle(Number(data.maintenance_days), membership.locale);
  const reorder = intervalTitle(Number(data.reorder_days), membership.locale);
  const details = [
    sku ? { label: messages.sku, value: sku } : null,
    unit ? { label: messages.unit, value: unitTitle(unit, membership.locale) } : null,
    maintenance ? { label: messages.maintenanceInterval, value: maintenance } : null,
    reorder ? { label: messages.reorderInterval, value: reorder } : null,
  ].filter((detail): detail is { label: string; value: string } => detail !== null);
  const pileAllowed = canManagePile(membership.role);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/products" className="inline-flex min-h-12 items-center text-sm font-semibold text-stamp">
        {messages.back}
      </Link>
      <header>
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">{data.name as string}</h1>
        {description ? <p className="mt-2 break-words text-base text-mute">{description}</p> : null}
      </header>
      {details.length > 0 ? (
        <dl>
          {details.map((detail) => (
            <div key={detail.label} className="flex min-h-12 items-center justify-between gap-3 border-b border-line">
              <dt className="text-sm text-mute">{detail.label}</dt>
              <dd className="text-right font-semibold break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <dl className="grid grid-cols-3 gap-3">
        {figures.map((figure) => (
          <div key={figure}>
            <dt className="text-sm text-mute">{messages[figure]}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{values[figure]}</dd>
          </div>
        ))}
      </dl>
      {pileAllowed ? (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.receive}</h2>
            <ReceiveStock productId={id} messages={messages} />
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.correctStock}</h2>
            <CorrectStock productId={id} messages={messages} />
          </section>
        </>
      ) : null}
    </div>
  );
}
