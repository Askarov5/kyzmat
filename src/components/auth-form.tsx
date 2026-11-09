"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/actions/session";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface AuthFormProps {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  messages: Messages;
  submitLabel: string;
}

const initialState: AuthState = { error: null, sentTo: null };

export function AuthForm({ action, messages, submitLabel }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const errorText =
    state.error === "required"
      ? messages.required
      : state.error === "member"
        ? messages.alreadyMember
        : state.error
          ? messages.authFailed
          : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {messages.companyName}
        <Field name="companyName" required autoComplete="organization" />
      </label>
      {errorText ? (
        <Notice>
          {errorText}
        </Notice>
      ) : null}
      <Button disabled={pending}>{pending ? messages.saving : submitLabel}</Button>
    </form>
  );
}
