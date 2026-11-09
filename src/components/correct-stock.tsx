"use client";

import { useActionState } from "react";
import { correctStock, type ProductFormState } from "@/app/actions/products";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface CorrectStockProps {
  productId: string;
  messages: Messages;
}

const initialState: ProductFormState = { error: null };

export function CorrectStock({ productId, messages }: CorrectStockProps) {
  const [state, action, pending] = useActionState(correctStock, initialState);
  const errorText =
    state.error === "quantity"
      ? messages.quantityInvalid
      : state.error === "held"
        ? messages.belowHeld
        : state.error === "warehouse" || state.error === "owner"
          ? messages.warehouseOnly
          : state.error
            ? messages.saveFailed
            : null;

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.onHand}
        <Field name="qty" inputMode="numeric" autoComplete="off" required className="tabular-nums" />
      </label>
      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.correct}</Button>
    </form>
  );
}
