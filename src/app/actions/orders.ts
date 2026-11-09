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
    | "denied"
    | "auth"
    | "save"
    | null;
}

export interface OrderStatusState {
  error: "denied" | "status" | "save" | null;
}

interface BalanceRow {
  qty: number;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function wholeQuantity(value: FormDataEntryValue | null): number | null {
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

function rpcBlob(error: { message?: string; details?: string; hint?: string; code?: string }): string {
  return [error.message, error.details, error.hint, error.code].filter(Boolean).join(" ").toLowerCase();
}

function mapBookError(error: { message?: string; details?: string; hint?: string; code?: string }): OrderFormState["error"] {
  const text = rpcBlob(error);

  if (text.includes("insufficient free")) return "free";
  if (text.includes("book denied") || text.includes("not authorized") || text.includes("42501")) return "denied";
  if (text.includes("bad address")) return "address";
  if (text.includes("bad quantity")) return "quantity";
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
  const productId = String(formData.get("productId") ?? "");
  const amount = wholeQuantity(formData.get("qty"));
  const scheduled = String(formData.get("scheduledOn") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!clientId) return { error: "required" };
  if (!addressId) return { error: "address" };
  if (!productId) return { error: "product" };
  if (!amount) return { error: "quantity" };
  if (scheduled && !datePattern.test(scheduled)) return { error: "save" };

  const supabase = await createClient();

  const [balanceResult, heldResult] = await Promise.all([
    supabase
      .from("stock_balances")
      .select("qty")
      .eq("product_id", productId)
      .eq("tenant_id", membership.tenantId)
      .maybeSingle(),
    supabase
      .from("order_lines")
      .select("product_id, qty, orders(status)")
      .eq("tenant_id", membership.tenantId)
      .eq("product_id", productId),
  ]);

  if (balanceResult.error || heldResult.error) {
    return { error: "save" };
  }

  const balance = balanceResult.data as BalanceRow | null;
  const onHand = balance?.qty ?? 0;
  const held = heldByProduct((heldResult.data ?? []) as HeldRow[]).get(productId) ?? 0;
  const available = freeQty(onHand, held);

  if (amount > available) {
    return { error: "free" };
  }

  const { data, error } = await supabase.rpc("book_order", {
    cid: clientId,
    aid: addressId,
    pid: productId,
    amount,
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
