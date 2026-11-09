export interface HeldRow {
  product_id: string;
  qty: number;
  orders: { status: string } | { status: string }[] | null;
}

export function heldByProduct(rows: HeldRow[]): Map<string, number> {
  const held = new Map<string, number>();

  for (const row of rows) {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
    const status = order?.status;
    if (status !== "open" && status !== "in_delivery") {
      continue;
    }

    const productId = row.product_id;
    held.set(productId, (held.get(productId) ?? 0) + Number(row.qty ?? 0));
  }

  return held;
}

export function freeQty(onHand: number, held: number): number {
  return Math.max(0, onHand - held);
}
