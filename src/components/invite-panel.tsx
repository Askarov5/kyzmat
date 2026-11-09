"use client";

import { useActionState } from "react";
import {
  removeMember,
  restoreMember,
  rotateInviteCode,
  type CompanyActionState,
} from "@/app/actions/company";
import { Button, ListRow, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { CompanyMember, MemberRole } from "@/lib/types";

interface InvitePanelProps {
  inviteCode: string;
  members: CompanyMember[];
  messages: Messages;
}

const initialState: CompanyActionState = { error: null, code: null };

function roleLabel(role: MemberRole, messages: Messages): string {
  if (role === "owner") return messages.memberRoleOwner;
  if (role === "warehouse") return messages.memberRoleWarehouse;
  return messages.memberRoleAgent;
}

export function InvitePanel({ inviteCode, members, messages }: InvitePanelProps) {
  const [rotateState, rotateAction, rotatePending] = useActionState(rotateInviteCode, initialState);
  const [removeState, removeAction, removePending] = useActionState(removeMember, initialState);
  const [restoreState, restoreAction, restorePending] = useActionState(restoreMember, initialState);

  const shownCode = rotateState.code ?? inviteCode;
  const error =
    rotateState.error === "owner" || removeState.error === "owner" || restoreState.error === "owner"
      ? messages.ownerOnly
      : rotateState.error || removeState.error || restoreState.error
        ? messages.saveFailed
        : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.inviteCode}</h2>
        <p className="text-2xl font-semibold tracking-wide tabular-nums" translate="no">
          {shownCode}
        </p>
        <form action={rotateAction}>
          <Button disabled={rotatePending}>{rotatePending ? messages.saving : messages.rotateCode}</Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-line pb-2 text-lg font-semibold">{messages.members}</h2>
        <ul className="overflow-hidden rounded-lg border border-line bg-white">
          {members.map((member) => (
            <ListRow key={member.id} ruled>
              <div className="flex min-h-12 items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="font-semibold">{roleLabel(member.role, messages)}</p>
                  {member.removedAt ? (
                    <p className="text-sm text-mute">{messages.memberRemoved}</p>
                  ) : null}
                </div>
                {member.role === "owner" ? null : member.removedAt ? (
                  <form action={restoreAction}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <button
                      type="submit"
                      disabled={restorePending}
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
                      disabled={removePending}
                      className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-danger"
                    >
                      {messages.removeMember}
                    </button>
                  </form>
                )}
              </div>
            </ListRow>
          ))}
        </ul>
      </section>

      {error ? <Notice>{error}</Notice> : null}
    </div>
  );
}
