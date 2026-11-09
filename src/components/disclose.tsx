"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PlusIcon } from "@/components/app-icons";

interface DiscloseContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DiscloseContext = createContext<DiscloseContextValue | null>(null);

function useDisclose(): DiscloseContextValue {
  const value = useContext(DiscloseContext);
  if (!value) {
    throw new Error("Disclose parts must be used inside Disclose");
  }
  return value;
}

interface DiscloseProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Disclose({ children, defaultOpen = false }: DiscloseProps) {
  const [open, setOpen] = useState(defaultOpen);
  return <DiscloseContext.Provider value={{ open, setOpen }}>{children}</DiscloseContext.Provider>;
}

interface DiscloseTriggerProps {
  label: string;
}

export function DiscloseTrigger({ label }: DiscloseTriggerProps) {
  const { open, setOpen } = useDisclose();

  if (open) {
    return null;
  }

  return (
    <button
      type="button"
      className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-stamp touch-manipulation [@media(hover:hover)]:hover:bg-row"
      onClick={() => setOpen(true)}
    >
      <PlusIcon className="size-4" />
      <span className="max-w-[9rem] truncate">{label}</span>
    </button>
  );
}

interface DisclosePanelProps {
  title: string;
  cancelLabel: string;
  children: ReactNode;
}

export function DisclosePanel({ title, cancelLabel, children }: DisclosePanelProps) {
  const { open, setOpen } = useDisclose();

  if (!open) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-stamp/25 bg-row-selected/40 p-3 shadow-sm">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-ink">{title}</h3>
        <button
          type="button"
          className="inline-flex min-h-12 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-mute touch-manipulation [@media(hover:hover)]:hover:bg-row"
          onClick={() => setOpen(false)}
        >
          {cancelLabel}
        </button>
      </div>
      {children}
    </div>
  );
}
