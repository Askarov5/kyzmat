"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/actions/session";
import type { Messages } from "@/i18n/types";

interface AuthFormProps {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  messages: Messages;
  mode: "login" | "signup" | "company";
  submitLabel: string;
}

const initialState: AuthState = { error: null };

export function AuthForm({ action, messages, mode, submitLabel }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const errorText =
    state.error === "confirm"
      ? messages.confirmEmail
      : state.error === "required"
        ? messages.required
        : state.error === "member"
          ? messages.alreadyMember
          : state.error
            ? messages.authFailed
            : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {mode !== "login" ? (
        <label className="flex flex-col gap-2 text-sm font-semibold">
          {messages.companyName}
          <input name="companyName" required autoComplete="organization" className="field" />
        </label>
      ) : null}
      {mode !== "company" ? (
        <>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {messages.email}
            <input
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              required
              className="field"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {messages.password}
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              className="field"
            />
          </label>
        </>
      ) : null}
      {errorText ? (
        <p className="text-sm text-danger" role="alert">
          {errorText}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="primary">
        {pending ? messages.saving : submitLabel}
      </button>
    </form>
  );
}
