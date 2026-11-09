"use client";

import { useActionState, useMemo, useState } from "react";
import { createProduct, type ProductFormState } from "@/app/actions/products";
import { Combobox } from "@/components/combobox";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import { catalogTitle, intervals, units } from "@/lib/catalog";
import type { Locale } from "@/lib/types";

interface ProductFormProps {
  messages: Messages;
  locale: Locale;
  extraUnits: string[];
}

const initialState: ProductFormState = { error: null };

export function ProductForm({ messages, locale, extraUnits }: ProductFormProps) {
  const [state, action, pending] = useActionState(createProduct, initialState);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const errorText =
    state.error === "required"
      ? messages.required
      : state.error === "owner"
        ? messages.ownerOnly
        : state.error === "interval"
          ? messages.intervalInvalid
          : state.error === "length"
            ? messages.tooLong
            : state.error
              ? messages.saveFailed
              : null;
  const unitOptions = useMemo(() => {
    const seedIds = new Set(units.map((unit) => unit.id));
    const extras = extraUnits
      .filter((unit) => unit && !seedIds.has(unit))
      .map((unit) => ({ id: unit, label: unit }))
      .sort((left, right) => left.label.localeCompare(right.label, locale === "ru" ? "ru" : "ky"));

    return [
      ...units.map((unit) => ({
        id: unit.id,
        label: catalogTitle(unit, locale),
        filterText: `${unit.nameKy} ${unit.nameRu}`,
      })),
      ...extras,
    ];
  }, [extraUnits, locale]);
  const intervalOptions = intervals.map((interval) => ({
    id: String(interval.days),
    label: catalogTitle(interval, locale),
    filterText: `${interval.nameKy} ${interval.nameRu}`,
  }));

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.name}
        <Field
          name="name"
          required
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.description}
        <Field
          name="description"
          autoComplete="off"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.sku}
        <Field
          name="sku"
          autoComplete="off"
          spellCheck={false}
          maxLength={40}
          value={sku}
          onChange={(event) => setSku(event.target.value)}
        />
      </label>
      <Combobox
        name="unit"
        queryName="newUnit"
        label={messages.unit}
        placeholder={messages.pickUnit}
        emptyLabel={messages.noMatch}
        addLabel={messages.addUnit}
        options={unitOptions}
      />
      <Combobox
        name="maintenanceDays"
        label={messages.maintenanceInterval}
        placeholder={messages.pickInterval}
        emptyLabel={messages.noMatch}
        options={intervalOptions}
      />
      <Combobox
        name="reorderDays"
        label={messages.reorderInterval}
        placeholder={messages.pickInterval}
        emptyLabel={messages.noMatch}
        options={intervalOptions}
      />
      {errorText ? (
        <Notice>
          {errorText}
        </Notice>
      ) : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.save}</Button>
    </form>
  );
}
