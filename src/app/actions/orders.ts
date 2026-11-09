"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canBook, requireMembership } from "@/lib/auth";
import { freeQty, heldByProduct, type HeldRow } from "@/lib/stock";
import { createClient } from "@/lib/supabase/server";

export interface OrderFormState {
  error:
    | "required"
    | "address"
    | "product"
    | "quantity"
    | "free"
    | "lines"
    | "denied"
    | "auth"
    | "save"
    | null;
}

export interface OrderStatusState {
  error: "denied" | "status" | "save" | null;
}

interface BalanceRow {
  product_id: string;
  qty: number;
}

interface BookLine {
  productId: string;
  qty: number;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function wholeQuantity(value: unknown): number | null {
  const raw = String(value ?? "").trim();

  if (!/^[1-9]\d{0,5}$/.test(raw)) {
    return null;
  }

  const amount = Number(raw);
  if (amount < 1 || amount > 100000) {
    return null;
  }

  return amount;
}

function parseBookLines(raw: FormDataEntryValue | null): BookLine[] | null {
  if (raw == null || String(raw).trim() === "") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 50) {
    return null;
  }

  const lines: BookLine[] = [];
  const seen = new Set<string>();

  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const row = item as { productId?: unknown; qty?: unknown };
    const productId = String(row.productId ?? "");
    const qty = wholeQuantity(row.qty);

    if (!uuidPattern.test(productId) || !qty) {
      return null;
    }

    if (seen.has(productId)) {
      return null;
    }

    seen.add(productId);
    lines.push({ productId, qty });
  }

  return lines;
}

function rpcBlob(error: { message?: string; details?: string; hint?: string; code?: string }): string {
  return [error.message, error.details, error.hint, error.code].filter(Boolean).join(" ").toLowerCase();
}

function mapBookError(error: { message?: string; details?: string; hint?: string; code?: string }): OrderFormState["error"] {
  const text = rpcBlob(error);

  if (text.includes("insufficient free")) return "free";
  if (text.includes("book denied") || text.includes("not authorized") || text.includes("42501")) return "denied";
  if (text.includes("bad address")) return "address";
  if (text.includes("bad quantity")) return "quantity";
  if (text.includes("bad lines")) return "lines";
  if (text.includes("not authenticated") || text.includes("jwt")) return "auth";
  if (text.includes("not found") || text.includes("no balance")) return "product";
  return "save";
}

export async function createOrder(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const membership = await requireMembership();

  if (!canBook(membership.role)) {
    return { error: "denied" };
  }

  const clientId = String(formData.get("clientId") ?? "");
  const addressId = String(formData.get("addressId") ?? "");
  const lines = parseBookLines(formData.get("lines"));
  const scheduled = String(formData.get("scheduledOn") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!clientId) return { error: "required" };
  if (!addressId) return { error: "address" };
  if (!lines) return { error: "lines" };
  if (scheduled && !datePattern.test(scheduled)) return { error: "save" };

  const productIds = lines.map((line) => line.productId);
  const supabase = await createClient();

  const [balanceResult, heldResult] = await Promise.all([
    supabase
      .from("stock_balances")
      .select("product_id, qty")
      .eq("tenant_id", membership.tenantId)
      .in("product_id", productIds),
    supabase
      .from("order_lines")
      .select("product_id, qty, orders(status)")
      .eq("tenant_id", membership.tenantId)
      .in("product_id", productIds),
  ]);

  if (balanceResult.error || heldResult.error) {
    return { error: "save" };
  }

  const onHandByProduct = new Map(
    ((balanceResult.data ?? []) as BalanceRow[]).map((row) => [row.product_id, row.qty]),
  );
  const heldMap = heldByProduct((heldResult.data ?? []) as HeldRow[]);

  for (const line of lines) {
    const onHand = onHandByProduct.get(line.productId) ?? 0;
    const held = heldMap.get(line.productId) ?? 0;
    const available = freeQty(onHand, held);

    if (line.qty > available) {
      return { error: "free" };
    }
  }

  const { data, error } = await supabase.rpc("book_order", {
    cid: clientId,
    aid: addressId,
    lines: lines.map((line) => ({ product_id: line.productId, qty: line.qty })),
    scheduled: scheduled || null,
    note_text: note || null,
  });

  if (error) {
    return { error: mapBookError(error) };
  }

  if (!data) return { error: "save" };

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/orders/${data as string}`);
}

export async function completeOrder(
  _prev: OrderStatusState,
  formData: FormData,
): Promise<OrderStatusState> {
  const membership = await requireMembership();

  if (!canBook(membership.role)) {
    return { error: "denied" };
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { error: "save" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_order", { oid: orderId });

  if (error) {
    const text = rpcBlob(error);
    if (text.includes("bad status")) {
      return { error: "status" };
    }
    if (text.includes("book denied")) {
      return { error: "denied" };
    }
    return { error: "save" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
  revalidatePath("/clients");
  return { error: null };
}

export async function cancelOrder(
  _prev: OrderStatusState,
  formData: FormData,
): Promise<OrderStatusState> {
  const membership = await requireMembership();

  if (!canBook(membership.role)) {
    return { error: "denied" };
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { error: "save" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_order", { oid: orderId });

  if (error) {
    const text = rpcBlob(error);
    if (text.includes("bad status")) {
      return { error: "status" };
    }
    if (text.includes("book denied")) {
      return { error: "denied" };
    }
    return { error: "save" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
  return { error: null };
}
