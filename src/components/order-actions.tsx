"use client";

import { useActionState, useState } from "react";
import {
  cancelOrder,
  completeOrder,
  type OrderStatusState,
} from "@/app/actions/orders";
import { Button, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface OrderActionsProps {
  orderId: string;
  messages: Messages;
}

const initialState: OrderStatusState = { error: null };

export function OrderActions({ orderId, messages }: OrderActionsProps) {
  const [cancelArmed, setCancelArmed] = useState(false);
  const [completeState, completeAction, completePending] = useActionState(
    completeOrder,
    initialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelOrder, initialState);

  const busy = completePending || cancelPending;
  const errorText =
    completeState.error === "denied" || cancelState.error === "denied"
      ? messages.bookDenied
      : completeState.error === "status"
        ? messages.completeFailed
        : cancelState.error === "status"
          ? messages.cancelFailed
          : completeState.error
            ? messages.completeFailed
            : cancelState.error
              ? messages.cancelFailed
              : null;

  return (
    <div className="flex flex-col gap-3">
      {errorText ? <Notice>{errorText}</Notice> : null}
      <form action={completeAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <Button className="w-full" disabled={busy || cancelArmed}>
          {completePending ? messages.saving : messages.complete}
        </Button>
      </form>
      {cancelArmed ? (
        <form
          action={cancelAction}
          className="flex flex-col gap-3 rounded-lg border border-danger p-3"
        >
          <input type="hidden" name="orderId" value={orderId} />
          <p className="text-sm">{messages.cancelOrderConfirm}</p>
          <Button tone="danger" className="w-full" disabled={busy}>
            {cancelPending ? messages.saving : messages.cancelOrderYes}
          </Button>
          <button
            type="button"
            onClick={() => setCancelArmed(false)}
            disabled={busy}
            className="min-h-12 font-semibold"
          >
            {messages.back}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCancelArmed(true)}
          disabled={busy}
          className="min-h-12 font-semibold text-danger"
        >
          {messages.cancelOrder}
        </button>
      )}
    </div>
  );
}
