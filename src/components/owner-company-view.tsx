"use client";

import { useState } from "react";
import { CompanyDetailsForm } from "@/components/company-details-form";
import { InvitePanel } from "@/components/invite-panel";
import { InviteShareButton } from "@/components/invite-share-button";
import { Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { CompanyDetails, CompanyMember, Locale } from "@/lib/types";

interface OwnerCompanyViewProps {
  tenantId: string;
  inviteCode: string;
  details: CompanyDetails;
  members: CompanyMember[];
  messages: Messages;
  locale: Locale;
}

export function OwnerCompanyView({
  tenantId,
  inviteCode,
  details,
  members,
  messages,
  locale,
}: OwnerCompanyViewProps) {
  const [password, setPassword] = useState(inviteCode);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 flex-1 text-pretty text-3xl font-semibold tracking-tight">
          {messages.companySettings}
        </h1>
        {password ? (
          <InviteShareButton tenantId={tenantId} password={password} messages={messages} />
        ) : null}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">
          {messages.companyDetails}
        </h2>
        <CompanyDetailsForm details={details} messages={messages} locale={locale} />
      </section>

      {!password ? (
        <Notice>{messages.saveFailed}</Notice>
      ) : (
        <InvitePanel
          tenantId={tenantId}
          inviteCode={password}
          members={members}
          messages={messages}
          onPasscodeChange={setPassword}
        />
      )}
    </div>
  );
}
