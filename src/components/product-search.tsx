"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/app-icons";
import { StockFigures } from "@/components/stock-figures";
import { Field, ListRow } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { Locale, ProductSummary } from "@/lib/types";

interface ProductSearchProps {
  products: ProductSummary[];
  messages: Messages;
  locale: Locale;
}

export function ProductSearch({ products, messages, locale }: ProductSearchProps) {
  const counts = useMemo(
    () => new Intl.NumberFormat(locale === "ru" ? "ru" : "ky"),
    [locale],
  );
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(needle));
  }, [needle, products]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="relative w-full min-w-0">
        <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-mute">
          <SearchIcon />
        </span>
        <Field
          id="product-search"
          value={query}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          inputMode="search"
          spellCheck={false}
          placeholder={messages.searchProduct}
          aria-label={messages.search}
          aria-controls="product-results"
          onChange={(event) => setQuery(event.target.value)}
          className="block w-full min-w-0 pl-10 pr-12"
        />
        {query ? (
          <button
            type="button"
            className="absolute inset-y-0 right-1 my-auto flex size-10 min-h-10 items-center justify-center rounded-lg text-xl leading-none text-mute"
            aria-label={messages.clear}
            onClick={() => setQuery("")}
          >
            ×
          </button>
        ) : null}
      </div>
      <ul id="product-results" className="overflow-hidden rounded-lg border border-line bg-white">
        {filtered.map((product) => (
          <ListRow key={product.id} ruled>
            <Link href={`/products/${product.id}`} className="flex min-h-12 flex-col justify-center gap-1 py-2">
              <span className="break-words text-base font-semibold">{product.name}</span>
              <StockFigures
                onHand={product.onHand}
                reserved={product.reserved}
                available={product.available}
                messages={messages}
                format={counts.format.bind(counts)}
              />
            </Link>
          </ListRow>
        ))}
        {products.length === 0 ? <li className="py-4 text-mute">{messages.noProducts}</li> : null}
        {products.length > 0 && filtered.length === 0 ? (
          <li className="py-4 text-mute">{messages.noMatch}</li>
        ) : null}
      </ul>
    </div>
  );
}
