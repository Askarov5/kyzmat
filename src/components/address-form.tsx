"use client";

import { useActionState } from "react";
import { addAddress, type FormState } from "@/app/actions/clients";
import { Combobox } from "@/components/combobox";
import type { Messages } from "@/i18n/types";
import type { Locale, LocalityOption } from "@/lib/types";

interface AddressFormProps {
  clientId: string;
  localities: LocalityOption[];
  locale: Locale;
  messages: Messages;
}

const initialState: FormState = { error: null };

export function AddressForm({ clientId, localities, locale, messages }: AddressFormProps) {
  const [state, action, pending] = useActionState(addAddress, initialState);
  const errorText =
    state.error === "locality"
      ? messages.pickLocality
      : state.error === "required"
        ? messages.required
        : state.error
          ? messages.authFailed
          : null;

  const options = localities.map((locality) => ({
    id: locality.id,
    label: locale === "ru" ? locality.nameRu : locality.nameKy,
    filterText: `${locality.nameKy} ${locality.nameRu}`,
  }));

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.street}
        <input name="line" required autoComplete="street-address" className="field" />
      </label>
      {localities.length === 0 ? (
        <p className="text-sm text-ink/70">{messages.noLocalities}</p>
      ) : (
        <Combobox
          name="localityId"
          label={messages.locality}
          placeholder={messages.pickLocality}
          emptyLabel={messages.noMatch}
          options={options}
        />
      )}
      {errorText ? (
        <p className="text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
      <button type="submit" disabled={pending || localities.length === 0} className="primary">
        {pending ? messages.saving : messages.save}
      </button>
    </form>
  );
}
