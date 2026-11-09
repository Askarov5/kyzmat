"use client";

import { useActionState } from "react";
import { createClientRecord, type FormState } from "@/app/actions/clients";
import { PlaceFields } from "@/components/place-fields";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface ClientFormProps {
  messages: Messages;
  initialName: string;
  locale: Locale;
}

const initialState: FormState = { error: null };

export function ClientForm({ messages, initialName, locale }: ClientFormProps) {
  const [state, action, pending] = useActionState(createClientRecord, initialState);
  const errorText =
    state.error === "phone"
      ? messages.invalidPhone
      : state.error === "address"
        ? messages.addressRequired
        : state.error === "oblast"
          ? messages.pickOblast
          : state.error === "locality"
            ? messages.pickRaion
            : state.error === "required"
              ? messages.required
              : state.error
                ? messages.saveFailed
                : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.name}
        <Field name="displayName" required defaultValue={initialName} autoComplete="name" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.phoneOptional}
        <Field name="phone" type="tel" inputMode="tel" autoComplete="tel" className="tabular-nums" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.address}
        <Field name="line" required autoComplete="street-address" />
      </label>
      <PlaceFields messages={messages} locale={locale} />
      {errorText ? (
        <Notice>
          {errorText}
        </Notice>
      ) : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.save}</Button>
    </form>
  );
}
