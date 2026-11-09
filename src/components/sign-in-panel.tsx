"use client";

import { useActionState, useState } from "react";
import {
  rememberCompany,
  sendWhatsAppCode,
  verifyWhatsAppCode,
  type AuthState,
} from "@/app/actions/session";
import { AppleIcon, GoogleIcon, WhatsAppIcon } from "@/components/app-icons";
import type { Messages } from "@/i18n/types";
import { createClient } from "@/lib/supabase/client";
import { kyrgyzPhoneDraft } from "@/lib/phone";
import { Button, Field, Notice } from "@/components/ui";

interface SignInPanelProps {
  intent: "login" | "signup";
  messages: Messages;
  failed: boolean;
  next?: string | null;
}

const initialState: AuthState = { error: null, sentTo: null };

async function startProvider(provider: "google" | "apple", next: string | null) {
  const supabase = createClient();
  const callback = new URL("/auth/callback", window.location.origin);
  if (next) {
    callback.searchParams.set("next", next);
  }
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callback.toString(),
    },
  });
}

export function SignInPanel({ intent, messages, failed, next = null }: SignInPanelProps) {
  const [sent, sendCode, sending] = useActionState(sendWhatsAppCode, initialState);
  const [checked, verifyCode, verifying] = useActionState(verifyWhatsAppCode, initialState);
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+996");
  const [missingName, setMissingName] = useState(false);
  const phone = checked.sentTo ?? sent.sentTo;
  const error = checked.error ?? sent.error;
  const nationalDigits = phoneNumber.replace(/^\+996/, "");

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

    await startProvider(provider, next);
  }

  return (
    <div className="flex flex-col gap-4">
      {phone ? (
        <form action={verifyCode} className="flex flex-col gap-4">
          <p className="text-base leading-snug text-mute">{messages.codeSent}</p>
          <input type="hidden" name="phone" value={phone} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
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
          {errorText ? <Notice>{errorText}</Notice> : null}
          <Button disabled={verifying} className="w-full">
            {verifying ? messages.saving : messages.continue}
          </Button>
        </form>
      ) : (
        <form action={sendCode} className="flex flex-col gap-4">
          <input type="hidden" name="intent" value={intent} />
          <input type="hidden" name="phone" value={phoneNumber} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
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
          <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="auth-phone">
            {messages.phone}
            <span
              className={`flex min-h-12 overflow-hidden rounded-lg border bg-field ${
                error === "phone" ? "border-danger" : "border-line"
              }`}
            >
              <span className="flex shrink-0 items-center border-r border-line bg-paper px-3 text-sm font-semibold tabular-nums text-mute">
                +996
              </span>
              <input
                id="auth-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                spellCheck={false}
                value={nationalDigits}
                maxLength={9}
                required
                aria-invalid={error === "phone" ? true : undefined}
                aria-describedby="auth-phone-prefix"
                className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums text-title-50 outline-none"
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
                  setPhoneNumber(kyrgyzPhoneDraft(`+996${digits}`));
                }}
              />
            </span>
            <span id="auth-phone-prefix" className="sr-only">
              +996
            </span>
          </label>
          {errorText ? <Notice>{errorText}</Notice> : null}
          <Button disabled={sending} className="w-full gap-2">
            <WhatsAppIcon className="size-5" />
            {sending ? messages.saving : messages.continueWhatsApp}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3" role="separator" aria-orientation="horizontal">
        <span className="h-px flex-1 bg-line" />
        <span className="text-sm font-semibold text-mute">{messages.or}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="choice inline-flex items-center justify-center gap-2 font-semibold"
          onClick={() => withCompany("google")}
        >
          <GoogleIcon className="size-5" />
          {messages.continueGoogle}
        </button>
        <button
          type="button"
          className="choice inline-flex items-center justify-center gap-2 font-semibold"
          onClick={() => withCompany("apple")}
        >
          <AppleIcon className="size-5" />
          {messages.continueApple}
        </button>
      </div>
    </div>
  );
}
