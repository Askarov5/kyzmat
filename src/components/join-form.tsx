"use client";

import { useActionState } from "react";
import { joinCompany, type CompanyActionState } from "@/app/actions/company";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface JoinFormProps {
  messages: Messages;
}

const initialState: CompanyActionState = { error: null, code: null };

export function JoinForm({ messages }: JoinFormProps) {
  const [state, action, pending] = useActionState(joinCompany, initialState);
  const errorText =
    state.error === "code"
      ? messages.badCode
      : state.error === "member"
        ? messages.alreadyMember
        : state.error
          ? messages.saveFailed
          : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor="join-code">
        {messages.joinCode}
        <Field
          id="join-code"
          name="code"
          autoComplete="off"
          required
          className="uppercase tracking-wide"
        />
      </label>
      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.joinCompany}</Button>
    </form>
  );
}
