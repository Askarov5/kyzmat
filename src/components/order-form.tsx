"use client";

import { useActionState, useMemo, useState } from "react";
import { createOrder, type OrderFormState } from "@/app/actions/orders";
import { Combobox } from "@/components/combobox";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface OrderClient {
  id: string;
  name: string;
}

interface OrderAddress {
  id: string;
  clientId: string;
  line: string;
}

interface OrderProduct {
  id: string;
  name: string;
  available: number;
}

interface OrderFormProps {
  clients: OrderClient[];
  addresses: OrderAddress[];
  products: OrderProduct[];
  messages: Messages;
  initialClientId?: string;
}

const initialState: OrderFormState = { error: null };

export function OrderForm({
  clients,
  addresses,
  products,
  messages,
  initialClientId = "",
}: OrderFormProps) {
  const [state, action, pending] = useActionState(createOrder, initialState);
  const [clientId, setClientId] = useState(initialClientId);
  const clientOptions = useMemo(
    () => clients.map((client) => ({ id: client.id, label: client.name })),
    [clients],
  );
  const addressOptions = useMemo(
    () =>
      addresses
        .filter((address) => address.clientId === clientId)
        .map((address) => ({ id: address.id, label: address.line })),
    [addresses, clientId],
  );
  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        label: `${product.name} · ${product.available}`,
      })),
    [products],
  );
  const errorText =
    state.error === "required"
      ? messages.required
      : state.error === "address"
        ? messages.addressRequired
        : state.error === "product"
          ? messages.pickProduct
          : state.error === "quantity"
            ? messages.quantityInvalid
            : state.error === "free"
              ? messages.insufficientFree
              : state.error === "denied"
                ? messages.bookDenied
                : state.error
                  ? messages.saveFailed
                  : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      {initialClientId ? <input type="hidden" name="clientId" value={initialClientId} /> : null}
      {initialClientId ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{messages.orderClient}</span>
          <p className="min-h-12 rounded-lg border border-line bg-field px-3 py-3 font-semibold">
            {clients.find((client) => client.id === initialClientId)?.name ?? ""}
          </p>
        </div>
      ) : (
        <Combobox
          name="clientId"
          label={messages.orderClient}
          placeholder={messages.pickClient}
          emptyLabel={messages.noMatch}
          options={clientOptions}
          required
          onPick={setClientId}
        />
      )}
      <Combobox
        key={clientId || "address"}
        name="addressId"
        label={messages.orderAddress}
        placeholder={messages.pickAddress}
        emptyLabel={messages.noMatch}
        options={addressOptions}
        required
        disabled={!clientId}
        startOpen={Boolean(clientId) && addressOptions.length > 0}
      />
      {clientId && addressOptions.length === 0 ? (
        <p className="text-sm text-mute">{messages.emptyAddresses}</p>
      ) : null}
      <Combobox
        name="productId"
        label={messages.orderProduct}
        placeholder={messages.pickProduct}
        emptyLabel={messages.noMatch}
        options={productOptions}
        required
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="order-qty">
        {messages.orderAmount}
        <Field
          id="order-qty"
          name="qty"
          inputMode="numeric"
          autoComplete="off"
          required
          className="tabular-nums"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="scheduled-on">
        {messages.scheduled}
        <Field id="scheduled-on" name="scheduledOn" type="date" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="order-note">
        {messages.notes}
        <Field id="order-note" name="note" maxLength={500} />
      </label>
      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.save}</Button>
    </form>
  );
}
