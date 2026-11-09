"use client";

import { useActionState, useEffect, useState } from "react";
import {
  removeMember,
  restoreMember,
  rotateInviteCode,
  setMemberRole,
  type CompanyActionState,
} from "@/app/actions/company";
import { CopyIcon, PhoneIcon } from "@/components/app-icons";
import { Badge } from "@/components/tailgrids/badge";
import { ListRow, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import { inviteUrl } from "@/lib/invite-link";
import type { CompanyMember, MemberRole } from "@/lib/types";

interface InvitePanelProps {
  tenantId: string;
  inviteCode: string;
  members: CompanyMember[];
  messages: Messages;
  onPasscodeChange?: (password: string) => void;
}

const initialState: CompanyActionState = { error: null, code: null };

function roleLabel(role: MemberRole, messages: Messages): string {
  if (role === "owner") return messages.memberRoleOwner;
  if (role === "warehouse") return messages.memberRoleWarehouse;
  return messages.memberRoleAgent;
}

function roleBadgeColor(role: MemberRole): "primary" | "blue" | "warning" {
  if (role === "owner") return "primary";
  if (role === "warehouse") return "warning";
  return "blue";
}

function memberTitle(member: CompanyMember, messages: Messages): string {
  if (member.displayName?.trim()) return member.displayName.trim();
  if (member.phoneE164) return member.phoneE164;
  return roleLabel(member.role, messages);
}

export function InvitePanel({
  tenantId,
  inviteCode,
  members,
  messages,
  onPasscodeChange,
}: InvitePanelProps) {
  const [rotateState, rotateAction, rotatePending] = useActionState(rotateInviteCode, initialState);
  const [removeState, removeAction, removePending] = useActionState(removeMember, initialState);
  const [restoreState, restoreAction, restorePending] = useActionState(restoreMember, initialState);
  const [roleState, roleAction, rolePending] = useActionState(setMemberRole, initialState);
  const [copied, setCopied] = useState(false);

  const shownPass = rotateState.code ?? inviteCode;

  useEffect(() => {
    if (rotateState.code) {
      onPasscodeChange?.(rotateState.code);
    }
  }, [rotateState.code, onPasscodeChange]);
  const error =
    rotateState.error === "owner" ||
    removeState.error === "owner" ||
    restoreState.error === "owner" ||
    roleState.error === "owner"
      ? messages.ownerOnly
      : rotateState.error || removeState.error || restoreState.error || roleState.error
        ? messages.saveFailed
        : null;

  const busy = rotatePending || removePending || restorePending || rolePending;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl(window.location.origin, tenantId, shownPass));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.inviteCode}</h2>
        <p className="text-sm text-mute">{messages.inviteLead}</p>
        <div className="flex flex-col gap-3 rounded-lg border border-stamp/25 bg-row-selected/40 p-3 shadow-sm">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-mute">{messages.meetingId}</p>
            <p className="break-all text-sm font-semibold tabular-nums text-ink" translate="no">
              {tenantId}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-mute">{messages.invitePassword}</p>
            <p
              className="text-2xl font-semibold tracking-[0.18em] tabular-nums text-ink"
              translate="no"
            >
              {shownPass}
            </p>
          </div>
          {error ? <Notice>{error}</Notice> : null}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void copyInviteLink()}
              className="choice inline-flex min-h-12 items-center justify-center gap-2 text-sm font-semibold text-stamp"
            >
              <CopyIcon className="size-4" />
              {copied ? messages.inviteLinkCopied : messages.copyInviteLink}
            </button>
            <form action={rotateAction} className="min-w-0">
              <button
                type="submit"
                disabled={busy}
                className="choice inline-flex min-h-12 w-full items-center justify-center text-sm font-semibold"
              >
                {rotatePending ? messages.saving : messages.rotateCode}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.members}</h2>
        {members.length === 0 ? (
          <p className="text-sm text-mute">{messages.noMembers}</p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-line bg-white">
            {members.map((member) => {
              const nextRole = member.role === "warehouse" ? "agent" : "warehouse";
              const removed = Boolean(member.removedAt);

              return (
                <ListRow
                  key={member.id}
                  ruled
                  className={removed ? "bg-paper/80" : undefined}
                >
                  <div className="flex min-h-12 flex-col gap-2 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-semibold ${removed ? "text-mute" : ""}`}
                          translate="no"
                        >
                          {memberTitle(member, messages)}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge color={roleBadgeColor(member.role)} size="sm">
                            {roleLabel(member.role, messages)}
                          </Badge>
                          {removed ? (
                            <Badge color="error" size="sm">
                              {messages.memberRemoved}
                            </Badge>
                          ) : null}
                        </div>
                        {member.phoneE164 && member.displayName ? (
                          <p
                            className="mt-1 flex items-center gap-1.5 tabular-nums text-sm text-mute"
                            translate="no"
                          >
                            <PhoneIcon className="size-3.5" />
                            {member.phoneE164}
                          </p>
                        ) : null}
                      </div>
                      {member.role === "owner" ? null : removed ? (
                        <form action={restoreAction}>
                          <input type="hidden" name="memberId" value={member.id} />
                          <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-stamp"
                          >
                            {messages.restoreMember}
                          </button>
                        </form>
                      ) : (
                        <form action={removeAction}>
                          <input type="hidden" name="memberId" value={member.id} />
                          <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-danger"
                          >
                            {messages.removeMember}
                          </button>
                        </form>
                      )}
                    </div>
                    {member.role !== "owner" && !removed ? (
                      <form action={roleAction}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <input type="hidden" name="role" value={nextRole} />
                        <button
                          type="submit"
                          disabled={busy}
                          className="choice inline-flex w-full items-center justify-center text-sm font-semibold"
                        >
                          {nextRole === "warehouse"
                            ? messages.makeWarehouse
                            : messages.makeAgent}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </ListRow>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
