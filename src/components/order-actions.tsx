"use client";

import { useActionState } from "react";
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
  const [completeState, completeAction, completePending] = useActionState(
    completeOrder,
    initialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelOrder, initialState);

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
        <Button disabled={completePending || cancelPending}>
          {completePending ? messages.saving : messages.complete}
        </Button>
      </form>
      <form action={cancelAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <Button tone="danger" disabled={completePending || cancelPending}>
          {cancelPending ? messages.saving : messages.cancelOrder}
        </Button>
      </form>
    </div>
  );
}
