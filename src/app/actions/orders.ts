"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canBook, requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface OrderFormState {
  error:
    | "required"
    | "address"
    | "product"
    | "quantity"
    | "free"
    | "denied"
    | "save"
    | null;
}

export interface OrderStatusState {
  error: "denied" | "status" | "save" | null;
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
  const { data, error } = await supabase.rpc("book_order", {
    cid: clientId,
    aid: addressId,
    pid: productId,
    amount,
    scheduled: scheduled || null,
    note_text: note || null,
  });

  if (error) {
    if (error.message.includes("insufficient free")) {
      return { error: "free" };
    }
    if (error.message.includes("book denied")) {
      return { error: "denied" };
    }
    if (error.message.includes("bad address")) {
      return { error: "address" };
    }
    if (error.message.includes("bad quantity")) {
      return { error: "quantity" };
    }
    return { error: "save" };
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
    if (error.message.includes("bad status")) {
      return { error: "status" };
    }
    if (error.message.includes("book denied")) {
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
    if (error.message.includes("bad status")) {
      return { error: "status" };
    }
    if (error.message.includes("book denied")) {
      return { error: "denied" };
    }
    return { error: "save" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
  return { error: null };
}
