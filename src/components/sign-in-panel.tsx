"use client";

import { useActionState, useState } from "react";
import {
  rememberCompany,
  sendWhatsAppCode,
  verifyWhatsAppCode,
  type AuthState,
} from "@/app/actions/session";
import type { Messages } from "@/i18n/types";
import { createClient } from "@/lib/supabase/client";
import { kyrgyzPhoneDraft } from "@/lib/phone";
import { Button, Field, Notice } from "@/components/ui";

interface SignInPanelProps {
  intent: "login" | "signup";
  messages: Messages;
  failed: boolean;
}

const initialState: AuthState = { error: null, sentTo: null };

async function startProvider(provider: "google" | "apple") {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export function SignInPanel({ intent, messages, failed }: SignInPanelProps) {
  const [sent, sendCode, sending] = useActionState(sendWhatsAppCode, initialState);
  const [checked, verifyCode, verifying] = useActionState(verifyWhatsAppCode, initialState);
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+996");
  const [missingName, setMissingName] = useState(false);
  const phone = checked.sentTo ?? sent.sentTo;
  const error = checked.error ?? sent.error;

  const errorText = missingName
    ? messages.required
    : error === "phone"
      ? messages.invalidPhone
      : error === "code"
        ? messages.badCode
        : error === "required"
          ? messages.required
          : error === "auth" || failed
            ? messages.authFailed
            : null;

  async function withCompany(provider: "google" | "apple") {
    if (intent === "signup" && companyName.trim().length === 0) {
      setMissingName(true);
      return;
    }

    setMissingName(false);

    if (intent === "signup") {
      await rememberCompany(companyName);
    }

    await startProvider(provider);
  }

  return (
    <div className="flex flex-col gap-3">
      {phone ? (
        <form action={verifyCode} className="flex flex-col gap-3">
          <p className="text-base">{messages.codeSent}</p>
          <input type="hidden" name="phone" value={phone} />
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {messages.code}
            <Field
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              required
              spellCheck={false}
              className="text-center text-lg tracking-[0.3em]"
            />
          </label>
          {errorText ? (
            <Notice>
              {errorText}
            </Notice>
          ) : null}
          <Button disabled={verifying}>{verifying ? messages.saving : messages.continue}</Button>
        </form>
      ) : (
        <form action={sendCode} className="flex flex-col gap-3">
          <input type="hidden" name="intent" value={intent} />
          {intent === "signup" ? (
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {messages.companyName}
              <Field
                name="companyName"
                value={companyName}
                onChange={(event) => {
                  setCompanyName(event.target.value);
                  setMissingName(false);
                }}
                required
                autoComplete="organization"
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {messages.phone}
            <Field
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              spellCheck={false}
              value={phoneNumber}
              pattern={"\\+996[0-9]{9}"}
              maxLength={13}
              required
              aria-invalid={error === "phone"}
              onChange={(event) => setPhoneNumber(kyrgyzPhoneDraft(event.target.value))}
              className="tabular-nums"
            />
          </label>
          {errorText ? (
            <Notice>
              {errorText}
            </Notice>
          ) : null}
          <Button disabled={sending}>{sending ? messages.saving : messages.continueWhatsApp}</Button>
        </form>
      )}
      <p className="py-1 text-center text-sm text-mute">{messages.or}</p>
      <button type="button" className="choice text-center" onClick={() => withCompany("google")}>
        {messages.continueGoogle}
      </button>
      <button type="button" className="choice text-center" onClick={() => withCompany("apple")}>
        {messages.continueApple}
      </button>
    </div>
  );
}
