"use client";

import { useActionState, useState } from "react";
import { correctStock, type ProductFormState } from "@/app/actions/products";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface CorrectStockProps {
  productId: string;
  messages: Messages;
}

const initialState: ProductFormState = { error: null };

export function CorrectStock({ productId, messages }: CorrectStockProps) {
  const [open, setOpen] = useState(false);
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-12 self-start font-semibold text-mute"
      >
        {messages.correctStock}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-field p-3">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <h2 className="min-w-0 flex-1 text-sm font-semibold">{messages.correctStock}</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="inline-flex min-h-12 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-mute"
        >
          {messages.cancel}
        </button>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="productId" value={productId} />
        <label className="flex flex-col gap-2 text-sm font-semibold">
          {messages.onHand}
          <Field name="qty" inputMode="numeric" autoComplete="off" required className="tabular-nums" />
        </label>
        {errorText ? <Notice>{errorText}</Notice> : null}
        <Button tone="danger" disabled={pending}>
          {pending ? messages.saving : messages.correct}
        </Button>
      </form>
    </div>
  );
}
