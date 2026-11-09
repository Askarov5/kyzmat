"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterIcon, SearchIcon } from "@/components/app-icons";
import { Combobox } from "@/components/combobox";
import { Badge } from "@/components/tailgrids/badge";
import { Button, Field, ListRow } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import { isOrderStatus, orderCode, orderMatchesQuery, orderStatusLabel } from "@/lib/orders";
import type { OrderStatus, OrderSummary } from "@/lib/types";

interface ClientOption {
  id: string;
  displayName: string;
}

interface OrderSearchProps {
  orders: OrderSummary[];
  messages: Messages;
  clients: ClientOption[];
  clientId: string | null;
  status: OrderStatus | null;
  emptyLabel?: string;
}

const ALL_STATUS = "all";

function ordersHref(clientId: string, status: string): string {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("clientId", clientId);
  }
  if (status && status !== ALL_STATUS && isOrderStatus(status)) {
    params.set("status", status);
  }
  const query = params.toString();
  return query ? `/orders?${query}` : "/orders";
}

function statusColor(status: OrderSummary["status"]): "primary" | "warning" | "success" | "error" {
  if (status === "in_delivery") return "warning";
  if (status === "completed") return "success";
  if (status === "cancelled") return "error";
  return "primary";
}

export function OrderSearch({
  orders,
  messages,
  clients,
  clientId,
  status,
  emptyLabel,
}: OrderSearchProps) {
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draftClientId, setDraftClientId] = useState(clientId ?? "");
  const [draftStatus, setDraftStatus] = useState(status ?? ALL_STATUS);

  const filtering = query.trim().length > 0;
  const filtered = useMemo(
    () => orders.filter((order) => orderMatchesQuery(order.id, order.clientName, query)),
    [orders, query],
  );

  const activeCount = (clientId ? 1 : 0) + (status ? 1 : 0);
  const statusValue = status ?? ALL_STATUS;

  const statusOptions = [
    { id: ALL_STATUS, label: messages.allStatuses },
    { id: "open", label: orderStatusLabel("open", messages) },
    { id: "in_delivery", label: orderStatusLabel("in_delivery", messages) },
    { id: "completed", label: orderStatusLabel("completed", messages) },
    { id: "cancelled", label: orderStatusLabel("cancelled", messages) },
  ];

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftClientId(clientId ?? "");
    setDraftStatus(status ?? ALL_STATUS);

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, clientId, status]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div ref={rootRef} className="relative flex w-full min-w-0 items-stretch gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-mute">
            <SearchIcon />
          </span>
          <Field
            id="order-search"
            value={query}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            inputMode="search"
            spellCheck={false}
            placeholder={messages.searchOrder}
            aria-label={messages.search}
            aria-controls="order-results"
            onChange={(event) => setQuery(event.target.value)}
            className="block w-full min-w-0 pl-10 pr-12"
          />
          {query ? (
            <button
              type="button"
              className="absolute inset-y-0 right-1 my-auto flex size-10 min-h-10 items-center justify-center rounded-lg text-xl leading-none text-mute"
              aria-label={messages.clear}
              onClick={() => setQuery("")}
            >
              ×
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={`relative inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-line touch-manipulation ${
            activeCount > 0
              ? "bg-row-selected text-stamp"
              : "bg-field text-mute [@media(hover:hover)]:hover:bg-row"
          }`}
          aria-expanded={open}
          aria-controls={panelId}
          aria-haspopup="dialog"
          aria-label={messages.filter}
          onClick={() => setOpen((value) => !value)}
        >
          <FilterIcon className="size-5" />
          {activeCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-stamp text-[10px] font-semibold text-white tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </button>

        {open ? (
          <div
            id={panelId}
            role="dialog"
            aria-label={messages.filter}
            className="absolute inset-x-0 top-full z-30 mt-1 flex flex-col gap-4 rounded-lg border border-line bg-white p-3 shadow-md"
          >
            <Combobox
              key={`draft-client-${open}-${clientId ?? "all"}`}
              name="order-filter-client"
              label={messages.orderClient}
              placeholder={messages.pickClient}
              emptyLabel={messages.noMatch}
              initialId={draftClientId}
              options={clients.map((client) => ({
                id: client.id,
                label: client.displayName,
              }))}
              onPick={(id) => setDraftClientId(id)}
            />
            <Combobox
              key={`draft-status-${open}-${statusValue}`}
              name="order-filter-status"
              label={messages.orderStatus}
              placeholder={messages.pickStatus}
              emptyLabel={messages.noMatch}
              initialId={draftStatus}
              options={statusOptions}
              onPick={(id) => setDraftStatus(id || ALL_STATUS)}
            />
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                router.push(ordersHref(draftClientId, draftStatus));
                setOpen(false);
              }}
            >
              {messages.applyFilters}
            </Button>
            {activeCount > 0 ? (
              <button
                type="button"
                className="min-h-12 font-semibold text-mute"
                onClick={() => {
                  router.push("/orders");
                  setOpen(false);
                }}
              >
                {messages.clearFilters}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <ul id="order-results" className="overflow-hidden rounded-lg border border-line bg-white">
        {filtered.map((order) => {
          const detail = [
            `#${orderCode(order.id)}`,
            order.scheduledOn,
            order.heldDays === null ? null : `${order.heldDays} ${messages.holding}`,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <ListRow key={order.id} ruled>
              <Link
                href={`/orders/${order.id}`}
                className="flex min-h-12 flex-col justify-center gap-1 py-2"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{order.clientName}</span>
                  <Badge color={statusColor(order.status)}>
                    {orderStatusLabel(order.status, messages)}
                  </Badge>
                </span>
                <span className="text-sm tabular-nums text-mute">{detail}</span>
              </Link>
            </ListRow>
          );
        })}
        {orders.length === 0 ? (
          <li className="px-3 py-4 text-mute">{emptyLabel ?? messages.noOrders}</li>
        ) : null}
        {filtering && filtered.length === 0 && orders.length > 0 ? (
          <li className="px-3 py-4 text-mute">{messages.noMatch}</li>
        ) : null}
      </ul>
    </div>
  );
}
