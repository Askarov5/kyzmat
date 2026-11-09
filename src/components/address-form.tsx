"use client";

import { useActionState } from "react";
import { addAddress, type FormState } from "@/app/actions/clients";
import { PlaceFields } from "@/components/place-fields";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface AddressFormProps {
  clientId: string;
  locale: Locale;
  messages: Messages;
}

const initialState: FormState = { error: null };

export function AddressForm({ clientId, locale, messages }: AddressFormProps) {
  const [state, action, pending] = useActionState(addAddress, initialState);
  const errorText =
    state.error === "address"
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
      <input type="hidden" name="clientId" value={clientId} />
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
      <Button disabled={pending} className="w-full">
        {pending ? messages.saving : messages.save}
      </Button>
    </form>
  );
}
