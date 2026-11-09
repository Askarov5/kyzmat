"use client";

import { useActionState, useState } from "react";
import { updateCompany, type CompanyDetailsState } from "@/app/actions/company";
import { PlaceFields } from "@/components/place-fields";
import { Button, Field, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import { kyrgyzPhoneDraft } from "@/lib/phone";
import type { CompanyDetails, Locale } from "@/lib/types";

interface CompanyDetailsFormProps {
  details: CompanyDetails;
  messages: Messages;
  locale: Locale;
}

const initialState: CompanyDetailsState = { error: null };

export function CompanyDetailsForm({ details, messages, locale }: CompanyDetailsFormProps) {
  const [state, action, pending] = useActionState(updateCompany, initialState);
  const [name, setName] = useState(details.name);
  const [phoneNumber, setPhoneNumber] = useState(details.phoneE164 ?? "+996");
  const [addressLine, setAddressLine] = useState(details.addressLine ?? "");
  const nationalDigits = phoneNumber.replace(/^\+996/, "");

  const errorText =
    state.error === "owner"
      ? messages.ownerOnly
      : state.error === "required"
        ? messages.required
        : state.error === "phone"
          ? messages.invalidPhone
          : state.error === "address"
            ? messages.addressRequired
            : state.error === "oblast"
              ? messages.pickOblast
              : state.error === "locality"
                ? messages.pickRaion
                : state.error
                  ? messages.saveFailed
                  : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="phone" value={phoneNumber} />
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="company-name">
        {messages.companyName}
        <Field
          id="company-name"
          name="companyName"
          required
          autoComplete="organization"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="company-phone">
        {messages.companyPhone}
        <span
          className={`flex min-h-12 overflow-hidden rounded-lg border bg-field ${
            state.error === "phone" ? "border-danger" : "border-line"
          }`}
        >
          <span className="flex shrink-0 items-center border-r border-line bg-paper px-3 text-sm font-semibold tabular-nums text-mute">
            +996
          </span>
          <input
            id="company-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            spellCheck={false}
            value={nationalDigits}
            maxLength={9}
            aria-invalid={state.error === "phone" ? true : undefined}
            className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums text-title-50 outline-none"
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
              setPhoneNumber(kyrgyzPhoneDraft(`+996${digits}`));
            }}
          />
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="company-address">
        {messages.companyAddress}
        <Field
          id="company-address"
          name="addressLine"
          autoComplete="street-address"
          value={addressLine}
          onChange={(event) => setAddressLine(event.target.value)}
        />
      </label>

      <PlaceFields
        messages={messages}
        locale={locale}
        required={addressLine.trim().length > 0}
        initialLocalityKy={details.localityKy}
      />

      {errorText ? <Notice>{errorText}</Notice> : null}
      <Button disabled={pending} className="w-full">
        {pending ? messages.saving : messages.saveCompany}
      </Button>
    </form>
  );
}
