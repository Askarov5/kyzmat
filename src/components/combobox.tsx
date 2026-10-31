"use client";

import { useMemo, useState } from "react";

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
  addLabel?: string;
  queryName?: string;
}

export function Combobox({
  label,
  placeholder,
  options,
  emptyLabel,
  name,
  addLabel,
  queryName,
}: ComboboxProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const listId = `${name}-list`;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return options;
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.filterText ?? ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [options, query]);

  const canAdd = Boolean(addLabel) && query.trim().length > 0 && filtered.length === 0;
  const activeId = filtered[activeIndex]?.id ?? "";

  function choose(option: ComboboxOption) {
    setSelectedId(option.id);
    setQuery(option.label);
    setAdding(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === "Enter" && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    }

    if (event.key === "Enter" && canAdd) {
      event.preventDefault();
      setSelectedId("");
      setAdding(true);
    }

    if (event.key === "Escape") {
      setQuery("");
      setSelectedId("");
      setAdding(false);
      setActiveIndex(0);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        value={query}
        role="combobox"
        placeholder={placeholder}
        autoComplete="off"
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId ? `${name}-${activeId}` : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelectedId("");
          setAdding(false);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
        className="field"
      />
      <input type="hidden" name={name} value={selectedId} />
      {queryName ? (
        <input type="hidden" name={queryName} value={adding ? query.trim() : ""} />
      ) : null}
      <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto border border-line bg-sheet">
        {filtered.length === 0 && !canAdd ? (
          <li className="px-3 py-3 text-sm text-ink/70">{emptyLabel}</li>
        ) : null}
        {filtered.map((option, index) => (
          <li key={option.id} className="list-row">
            <button
              id={`${name}-${option.id}`}
              type="button"
              role="option"
              aria-selected={selectedId === option.id || index === activeIndex}
              onClick={() => choose(option)}
              className="choice"
            >
              {option.label}
            </button>
          </li>
        ))}
        {canAdd ? (
          <li>
            <button
              type="button"
              onClick={() => {
                setSelectedId("");
                setAdding(true);
              }}
              className="choice font-semibold"
              aria-pressed={adding}
            >
              {addLabel}: {query.trim()}
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
