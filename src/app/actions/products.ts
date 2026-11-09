"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { optionalInterval, optionalUnit } from "@/lib/catalog";
import { canManagePile, requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ProductFormState {
  error:
    | "required"
    | "owner"
    | "warehouse"
    | "quantity"
    | "held"
    | "interval"
    | "length"
    | "save"
    | null;
}

function wholeQuantity(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();

  if (!/^[1-9]\d{0,5}$/.test(raw)) {
    return null;
  }

  return Number(raw);
}

function wholeOnHand(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();

  if (!/^\d{1,6}$/.test(raw)) {
    return null;
  }

  const amount = Number(raw);
  if (amount > 100000) {
    return null;
  }

  return amount;
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const membership = await requireMembership();

  if (membership.role !== "owner") {
    return { error: "owner" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const unit = optionalUnit(String(formData.get("unit") ?? ""), String(formData.get("newUnit") ?? ""));
  const maintenanceDays = optionalInterval(formData.get("maintenanceDays"));
  const reorderDays = optionalInterval(formData.get("reorderDays"));

  if (!name) {
    return { error: "required" };
  }

  if (maintenanceDays === "invalid" || reorderDays === "invalid") {
    return { error: "interval" };
  }

  if (sku.length > 40 || unit === "invalid") {
    return { error: "length" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      tenant_id: membership.tenantId,
      name,
      description: description || null,
      sku: sku || null,
      unit,
      maintenance_days: maintenanceDays,
      reorder_days: reorderDays,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "save" };
  }

  revalidatePath("/products");
  redirect(`/products/${data.id}`);
}

export async function receiveStock(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const membership = await requireMembership();

  if (!canManagePile(membership.role)) {
    return { error: "warehouse" };
  }

  const productId = String(formData.get("productId") ?? "");
  const amount = wholeQuantity(formData.get("qty"));

  if (!amount) {
    return { error: "quantity" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("receive_stock", {
    pid: productId,
    amount,
  });

  if (error) {
    return { error: "save" };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  return { error: null };
}

export async function correctStock(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const membership = await requireMembership();

  if (!canManagePile(membership.role)) {
    return { error: "warehouse" };
  }

  const productId = String(formData.get("productId") ?? "");
  const newQty = wholeOnHand(formData.get("qty"));

  if (newQty === null) {
    return { error: "quantity" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("correct_stock", {
    pid: productId,
    new_qty: newQty,
  });

  if (error) {
    if (error.message.includes("below held")) {
      return { error: "held" };
    }
    if (error.message.includes("bad quantity")) {
      return { error: "quantity" };
    }
    return { error: "save" };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  return { error: null };
}
