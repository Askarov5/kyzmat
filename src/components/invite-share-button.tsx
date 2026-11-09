"use client";

import { useEffect, useState } from "react";
import { ShareIcon } from "@/components/app-icons";
import { Button } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import { inviteUrl } from "@/lib/invite-link";

interface InviteShareButtonProps {
  tenantId: string;
  password: string;
  messages: Messages;
}

export function InviteShareButton({ tenantId, password, messages }: InviteShareButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function shareInvite() {
    const url = inviteUrl(window.location.origin, tenantId, password);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: messages.inviteCode,
          text: messages.inviteLead,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={() => void shareInvite()}
      className="shrink-0 gap-1.5 px-3 [&_svg]:size-5"
    >
      <ShareIcon className="size-5" />
      <span className="max-w-[9rem] truncate sm:max-w-none">
        {copied ? messages.inviteLinkCopied : messages.inviteCode}
      </span>
    </Button>
  );
}
