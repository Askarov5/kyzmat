"use client";

import { useActionState, useMemo, useState } from "react";
import { createOrder, type OrderFormState } from "@/app/actions/orders";
import { Combobox } from "@/components/combobox";
import { StockFigures } from "@/components/stock-figures";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { ProductSummary } from "@/lib/types";

interface OrderClient {
  id: string;
  name: string;
}

interface OrderAddress {
  id: string;
  clientId: string;
  line: string;
}

interface OrderFormProps {
  clients: OrderClient[];
  addresses: OrderAddress[];
  products: ProductSummary[];
  messages: Messages;
  locale: "ky" | "ru";
  initialClientId?: string;
}

const initialState: OrderFormState = { error: null };

export function OrderForm({
  clients,
  addresses,
  products,
  messages,
  locale,
  initialClientId = "",
}: OrderFormProps) {
  const [state, action, pending] = useActionState(createOrder, initialState);
  const [clientId, setClientId] = useState(initialClientId);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [localError, setLocalError] = useState<OrderFormState["error"]>(null);
  const counts = useMemo(
    () => new Intl.NumberFormat(locale === "ru" ? "ru" : "ky"),
    [locale],
  );
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
  const autoAddressId = addressOptions[0]?.id ?? "";
  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        label: product.name,
      })),
    [products],
  );
  const selectedProduct = products.find((product) => product.id === productId);
  const shownError = localError ?? state.error;
  const errorText =
    shownError === "required"
      ? messages.needClient
      : shownError === "address"
        ? messages.addressRequired
        : shownError === "product"
          ? messages.pickProduct
          : shownError === "quantity"
            ? messages.quantityInvalid
            : shownError === "free"
              ? messages.insufficientFree
              : shownError === "denied"
                ? messages.bookDenied
                : shownError === "auth"
                  ? messages.signInNeeded
                  : shownError
                    ? messages.saveFailed
                    : null;

  function onSubmit(formData: FormData) {
    setLocalError(null);
    const amountRaw = String(formData.get("qty") ?? "").trim();
    const amount = Number(amountRaw);

    if (!/^[1-9]\d{0,5}$/.test(amountRaw)) {
      setLocalError("quantity");
      return;
    }

    if (selectedProduct && amount > selectedProduct.available) {
      setLocalError("free");
      return;
    }

    action(formData);
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      {initialClientId ? <input type="hidden" name="clientId" value={initialClientId} /> : null}
      {initialClientId ? (
        <div className="flex flex-col gap-2">
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
        key={`${clientId || "address"}:${autoAddressId || "none"}`}
        name="addressId"
        label={messages.orderAddress}
        placeholder={messages.pickAddress}
        emptyLabel={messages.noMatch}
        options={addressOptions}
        required
        disabled={!clientId || addressOptions.length === 0}
        initialId={autoAddressId}
        startOpen={Boolean(clientId) && addressOptions.length > 1}
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
        onPick={(id) => {
          setProductId(id);
          setLocalError(null);
        }}
      />
      {selectedProduct ? (
        <StockFigures
          onHand={selectedProduct.onHand}
          reserved={selectedProduct.reserved}
          available={selectedProduct.available}
          messages={messages}
          format={counts.format.bind(counts)}
        />
      ) : null}
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="order-qty">
        {messages.orderAmount}
        <Field
          id="order-qty"
          name="qty"
          inputMode="numeric"
          autoComplete="off"
          required
          value={qty}
          max={selectedProduct ? String(selectedProduct.available) : undefined}
          aria-invalid={shownError === "free" || shownError === "quantity" ? true : undefined}
          className="tabular-nums"
          onChange={(event) => {
            setQty(event.target.value);
            setLocalError(null);
          }}
        />
        {selectedProduct ? (
          <span className="text-sm font-normal tabular-nums text-mute">
            {messages.available} {counts.format(selectedProduct.available)}
          </span>
        ) : null}
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="scheduled-on">
        {messages.scheduled}
        <Field id="scheduled-on" name="scheduledOn" type="date" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="order-note">
        {messages.notes}
        <Field id="order-note" name="note" maxLength={500} />
      </label>
      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending} className="w-full">
        {pending ? messages.saving : messages.save}
      </Button>
    </form>
  );
}
