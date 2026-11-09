"use client";

import { useActionState } from "react";
import { receiveStock, type ProductFormState } from "@/app/actions/products";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface ReceiveStockProps {
  productId: string;
  messages: Messages;
}

const initialState: ProductFormState = { error: null };

export function ReceiveStock({ productId, messages }: ReceiveStockProps) {
  const [state, action, pending] = useActionState(receiveStock, initialState);
  const errorText =
    state.error === "quantity"
      ? messages.quantityInvalid
      : state.error === "warehouse" || state.error === "owner"
        ? messages.warehouseOnly
        : state.error
          ? messages.saveFailed
          : null;

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.quantity}
        <Field name="qty" inputMode="numeric" autoComplete="off" required className="tabular-nums" />
      </label>
      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.receive}</Button>
    </form>
  );
}
