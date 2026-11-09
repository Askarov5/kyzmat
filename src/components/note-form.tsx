"use client";

import { useActionState, useState } from "react";
import { addNote, type FormState } from "@/app/actions/clients";
import { Combobox } from "@/components/combobox";
import { Button, Field, Notice } from "@/components/ui";
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
  const [body, setBody] = useState("");
  const [phraseId, setPhraseId] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="phraseId" value={phraseId} />
      <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="note-body">
        {messages.noteText}
        <Field
          id="note-body"
          name="body"
          value={body}
          required
          autoComplete="off"
          placeholder={messages.noteTextHint}
          onChange={(event) => {
            setBody(event.target.value);
            setPhraseId("");
          }}
        />
      </label>
      {phrases.length > 0 ? (
        <Combobox
          name="phrasePick"
          label={messages.pickNote}
          placeholder={messages.pickNote}
          emptyLabel={messages.noMatch}
          options={phrases.map((phrase) => ({ id: phrase.id, label: phrase.body }))}
          onPick={(id) => {
            const phrase = phrases.find((item) => item.id === id);
            setPhraseId(id);
            setBody(phrase?.body ?? "");
          }}
        />
      ) : null}
      {state.error ? (
        <Notice>
          {state.error === "required" ? messages.noteTextRequired : messages.saveFailed}
        </Notice>
      ) : null}
      <Button disabled={pending} className="w-full">
        {pending ? messages.saving : messages.save}
      </Button>
    </form>
  );
}
