"use client";

import { useActionState, useMemo, useState } from "react";
import { createOrder, type OrderFormState } from "@/app/actions/orders";
import { Combobox } from "@/components/combobox";
import { StockFigures } from "@/components/stock-figures";
import { Button, Field, ListRow, Notice } from "@/components/ui";
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

interface StagedLine {
  productId: string;
  name: string;
  qty: number;
  priceSom: number;
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
  const [lines, setLines] = useState<StagedLine[]>([]);
  const [scheduledOn, setScheduledOn] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
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
  const stagedIds = useMemo(() => new Set(lines.map((line) => line.productId)), [lines]);
  const productOptions = useMemo(
    () =>
      products
        .filter((product) => !stagedIds.has(product.id))
        .map((product) => ({
          id: product.id,
          label: product.name,
        })),
    [products, stagedIds],
  );
  const selectedProduct = products.find((product) => product.id === productId);
  const stagedForSelected = lines
    .filter((line) => line.productId === productId)
    .reduce((sum, line) => sum + line.qty, 0);
  const availableForPick = selectedProduct
    ? Math.max(0, selectedProduct.available - stagedForSelected)
    : 0;
  const orderTotalSom = useMemo(
    () => lines.reduce((sum, line) => sum + line.priceSom * line.qty, 0),
    [lines],
  );
  const shownError = localError ?? state.error;
  const errorText =
    shownError === "required"
      ? messages.needClient
      : shownError === "address"
        ? messages.addressRequired
        : shownError === "product"
          ? messages.pickProduct
          : shownError === "lines"
            ? messages.needLines
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

  function addLine() {
    setLocalError(null);

    if (!selectedProduct || !productId) {
      setLocalError("product");
      return;
    }

    if (!/^[1-9]\d{0,5}$/.test(qty.trim())) {
      setLocalError("quantity");
      return;
    }

    const amount = Number(qty.trim());
    if (amount > availableForPick) {
      setLocalError("free");
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        qty: amount,
        priceSom: selectedProduct.priceSom,
      },
    ]);
    setProductId("");
    setQty("");
  }

  function removeLine(productIdToRemove: string) {
    setLocalError(null);
    setLines((prev) => prev.filter((line) => line.productId !== productIdToRemove));
  }

  function onSubmit(formData: FormData) {
    setLocalError(null);

    if (lines.length === 0) {
      setLocalError("lines");
      return;
    }

    formData.set(
      "lines",
      JSON.stringify(lines.map((line) => ({ productId: line.productId, qty: line.qty }))),
    );
    action(formData);
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      {initialClientId ? <input type="hidden" name="clientId" value={initialClientId} /> : null}
      <input type="hidden" name="lines" value="[]" readOnly />
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

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold">{messages.orderLines}</span>
        {lines.length > 0 ? (
          <ul className="overflow-hidden rounded-lg border border-line bg-white">
            {lines.map((line) => (
              <ListRow key={line.productId} ruled>
                <div className="flex min-h-12 items-center justify-between gap-3 py-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{line.name}</p>
                    <p className="tabular-nums text-sm text-mute">
                      {counts.format(line.qty)} × {counts.format(line.priceSom)} {messages.som}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <p className="tabular-nums text-sm font-semibold">
                      {counts.format(line.priceSom * line.qty)} {messages.som}
                    </p>
                    <button
                      type="button"
                      className="min-h-12 shrink-0 px-2 text-sm font-semibold text-danger"
                      aria-label={`${messages.removeLine} ${line.name}`}
                      onClick={() => removeLine(line.productId)}
                    >
                      {messages.removeLine}
                    </button>
                  </div>
                </div>
              </ListRow>
            ))}
            <ListRow>
              <div className="flex min-h-12 items-center justify-between gap-3 py-1">
                <span className="text-sm font-semibold">{messages.orderTotal}</span>
                <span className="tabular-nums text-base font-semibold">
                  {counts.format(orderTotalSom)} {messages.som}
                </span>
              </div>
            </ListRow>
          </ul>
        ) : null}

        <div className="flex flex-col gap-3 rounded-lg border border-stamp/25 bg-row-selected/40 p-3 shadow-sm">
          <p className="text-sm font-semibold">{messages.addLineTitle}</p>
          <Combobox
            key={`product-picker:${lines.map((line) => line.productId).join(",")}`}
            name="draftProductId"
            label={messages.orderProduct}
            placeholder={messages.pickProduct}
            emptyLabel={messages.noMatch}
            options={productOptions}
            onPick={(id) => {
              setProductId(id);
              setLocalError(null);
            }}
          />
          {selectedProduct ? (
            <>
              <p className="tabular-nums text-sm text-mute">
                {messages.price} {counts.format(selectedProduct.priceSom)} {messages.som}
              </p>
              <StockFigures
                onHand={selectedProduct.onHand}
                reserved={selectedProduct.reserved}
                available={availableForPick}
                messages={messages}
                format={counts.format.bind(counts)}
              />
            </>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="order-qty">
            {messages.orderAmount}
            <Field
              id="order-qty"
              name="draftQty"
              inputMode="numeric"
              autoComplete="off"
              value={qty}
              max={selectedProduct ? String(availableForPick) : undefined}
              aria-invalid={shownError === "free" || shownError === "quantity" ? true : undefined}
              className="tabular-nums"
              onChange={(event) => {
                setQty(event.target.value);
                setLocalError(null);
              }}
            />
            {selectedProduct ? (
              <span className="text-sm font-normal tabular-nums text-mute">
                {messages.available} {counts.format(availableForPick)}
              </span>
            ) : null}
          </label>
          <button
            type="button"
            onClick={addLine}
            className="choice flex min-h-12 items-center justify-center rounded-lg border border-line bg-white text-sm font-semibold text-stamp"
          >
            {messages.addLine}
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="scheduled-on">
        {messages.scheduled}
        <Field
          id="scheduled-on"
          name="scheduledOn"
          type="date"
          value={scheduledOn}
          onChange={(event) => setScheduledOn(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="order-note">
        {messages.notes}
        <Field id="order-note" name="note" maxLength={500} />
      </label>
      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending || lines.length === 0} className="w-full">
        {pending ? messages.saving : messages.save}
      </Button>
    </form>
  );
}
