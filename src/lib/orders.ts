import type { Messages } from "@/i18n/types";
import type { OrderStatus } from "@/lib/types";

const terminal: OrderStatus[] = ["completed", "cancelled"];

export function orderCode(id: string): string {
  const hex = id.replace(/-/g, "").toUpperCase();
  return hex.slice(-8);
}

export function orderMatchesQuery(id: string, clientName: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const code = orderCode(id).toLowerCase();
  const bare = id.replace(/-/g, "").toLowerCase();
  return (
    clientName.toLowerCase().includes(needle) ||
    code.includes(needle.replace(/^#/, "")) ||
    bare.includes(needle.replace(/-/g, ""))
  );
}

export function isOrderStatus(value: string): value is OrderStatus {
  return value === "open" || value === "in_delivery" || value === "completed" || value === "cancelled";
}

export function orderStatusLabel(status: OrderStatus, messages: Messages): string {
  if (status === "in_delivery") return messages.statusDelivery;
  if (status === "completed") return messages.statusDone;
  if (status === "cancelled") return messages.statusCancelled;
  return messages.statusOpen;
}

export function heldDays(createdAt: string, status: OrderStatus): number | null {
  if (terminal.includes(status)) return null;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const now = new Date();
  const start = Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((today - start) / 86400000));
}
