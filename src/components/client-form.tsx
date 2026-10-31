"use client";

import { useActionState } from "react";
import { createClientRecord, type FormState } from "@/app/actions/clients";
import type { Messages } from "@/i18n/types";

interface ClientFormProps {
  messages: Messages;
  initialName: string;
}

const initialState: FormState = { error: null };

export function ClientForm({ messages, initialName }: ClientFormProps) {
  const [state, action, pending] = useActionState(createClientRecord, initialState);
  const errorText =
    state.error === "phone"
      ? messages.invalidPhone
      : state.error === "required"
        ? messages.required
        : state.error
          ? messages.authFailed
          : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.name}
        <input name="displayName" required defaultValue={initialName} autoComplete="name" className="field" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.phoneOptional}
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field tabular-nums" />
      </label>
      {errorText ? (
        <p className="text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="primary">
        {pending ? messages.saving : messages.save}
      </button>
    </form>
  );
}
