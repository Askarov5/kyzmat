"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

interface ChevronProps {
  open: boolean;
}

function Chevron({ open }: ChevronProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={cx(
        "pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2",
        "transition-transform duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        open && "rotate-180",
      )}
    >
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export interface ComboboxOption {
  id: string;
  label: string;
  filterText?: string;
}

interface ComboboxProps {
  label: string;
  placeholder: string;
  options: ComboboxOption[];
  emptyLabel: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  startOpen?: boolean;
  initialId?: string;
  onPick?: (id: string) => void;
  addLabel?: string;
  queryName?: string;
}

export function Combobox({
  label,
  placeholder,
  options,
  emptyLabel,
  name,
  required = false,
  disabled = false,
  startOpen = false,
  initialId = "",
  onPick,
  addLabel,
  queryName,
}: ComboboxProps) {
  const initialOption = initialId ? options.find((option) => option.id === initialId) : undefined;
  const [query, setQuery] = useState(initialOption?.label ?? "");
  const [selectedId, setSelectedId] = useState(initialOption?.id ?? "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(startOpen && !initialOption);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = `${name}-list`;
  const selected = options.find((option) => option.id === selectedId);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const showingAll = !needle || (selected ? needle === selected.label.toLowerCase() : false);

    if (showingAll) {
      return options;
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.filterText ?? ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [options, query, selected]);

  const canAdd = Boolean(addLabel) && query.trim().length > 0 && filtered.length === 0;
  const activeId = open ? (filtered[activeIndex]?.id ?? "") : "";
  const listOpen = open && !disabled;

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    const input = inputRef.current;

    if (!input || !required || disabled) {
      input?.setCustomValidity("");
      return;
    }

    input.setCustomValidity(selectedId ? "" : placeholder);
  }, [disabled, placeholder, required, selectedId]);

  function choose(option: ComboboxOption) {
    setSelectedId(option.id);
    setQuery(option.label);
    setAdding(false);
    setOpen(false);
    onPick?.(option.id);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => {
        if (event.key === "ArrowDown") {
          return Math.min(index + 1, Math.max(filtered.length - 1, 0));
        }

        return Math.max(index - 1, 0);
      });
    }

    if (event.key === "Enter" && listOpen && activeIndex >= 0 && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    }

    if (event.key === "Enter" && canAdd) {
      event.preventDefault();
      setSelectedId("");
      setAdding(true);
      setOpen(false);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      <label className="text-sm font-semibold" htmlFor={name}>
        {label}
      </label>
      <div className="relative text-ink has-[:disabled]:text-mute">
        <input
          ref={inputRef}
          id={name}
          value={query}
          role="combobox"
          placeholder={placeholder}
          autoComplete="off"
          required={required && !disabled}
          disabled={disabled}
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId ? `${name}-${activeId}` : undefined}
          onPointerDown={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                setOpen(false);
              }
            }, 0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId("");
            setAdding(false);
            setActiveIndex(-1);
            setOpen(true);
            onPick?.("");
          }}
          onKeyDown={onKeyDown}
          className="min-h-12 w-full rounded-lg border border-line bg-white pr-10 pl-4 text-base font-normal text-title-50 placeholder:text-mute focus:border-primary-300 focus:ring-4 focus:ring-primary-300/20 focus:outline-none disabled:bg-paper disabled:text-mute"
        />
        <Chevron open={listOpen} />
        {listOpen ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-white shadow-md"
          >
            {filtered.length === 0 && !canAdd ? (
              <li className="px-3 py-3 text-sm text-mute">{emptyLabel}</li>
            ) : null}
            {filtered.map((option, index) => (
              <li key={option.id} className="border-b border-line last:border-b-0">
                <button
                  id={`${name}-${option.id}`}
                  type="button"
                  role="option"
                  aria-selected={selectedId === option.id}
                  data-active={index === activeIndex ? "true" : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  className={cx(
                    "flex min-h-12 w-full items-center px-3 text-left text-base text-ink [@media(hover:hover)]:hover:bg-row",
                    index === activeIndex && "bg-row",
                    selectedId === option.id && "bg-row-selected",
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
            {canAdd ? (
              <li className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelectedId("");
                    setAdding(true);
                    setOpen(false);
                  }}
                  className="flex min-h-12 w-full items-center px-3 text-left text-base font-semibold text-ink [@media(hover:hover)]:hover:bg-row"
                  aria-pressed={adding}
                >
                  {addLabel}: {query.trim()}
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
      <input type="hidden" name={name} value={selectedId} />
      {queryName ? (
        <input type="hidden" name={queryName} value={adding ? query.trim() : ""} />
      ) : null}
    </div>
  );
}
