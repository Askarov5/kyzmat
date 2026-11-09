"use client";

import { useState } from "react";
import { archiveClient } from "@/app/actions/clients";
import { Button } from "@/components/ui";
import type { Messages } from "@/i18n/types";

interface ArchiveControlProps {
  clientId: string;
  messages: Messages;
}

export function ArchiveControl({ clientId, messages }: ArchiveControlProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="min-h-12 font-semibold text-danger">
        {messages.archive}
      </button>
    );
  }

  return (
    <form action={archiveClient} className="flex flex-col gap-3 border border-danger p-3">
      <input type="hidden" name="clientId" value={clientId} />
      <p>{messages.archiveConfirm}</p>
      <Button tone="danger">{messages.archiveYes}</Button>
      <button type="button" onClick={() => setArmed(false)} className="min-h-12 font-semibold">
        {messages.back}
      </button>
    </form>
  );
}
