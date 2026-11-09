"use client";

import { useActionState } from "react";
import { addNote, type FormState } from "@/app/actions/clients";
import { Combobox } from "@/components/combobox";
import { Button, Notice } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { NotePhraseOption } from "@/lib/types";

interface NoteFormProps {
  clientId: string;
  phrases: NotePhraseOption[];
  messages: Messages;
}

const initialState: FormState = { error: null };

export function NoteForm({ clientId, phrases, messages }: NoteFormProps) {
  const [state, action, pending] = useActionState(addNote, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <Combobox
        name="phraseId"
        queryName="newPhrase"
        label={messages.pickNote}
        placeholder={messages.pickNote}
        emptyLabel={messages.noMatch}
        addLabel={messages.addPhrase}
        options={phrases.map((phrase) => ({ id: phrase.id, label: phrase.body }))}
      />
      {state.error ? (
        <Notice>
          {state.error === "required" ? messages.required : messages.saveFailed}
        </Notice>
      ) : null}
      <Button disabled={pending}>{pending ? messages.saving : messages.save}</Button>
    </form>
  );
}
