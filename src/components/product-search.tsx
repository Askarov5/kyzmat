"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Messages } from "@/i18n/types";
import type { Locale, ProductSummary } from "@/lib/types";
import { Field, ListRow } from "@/components/ui";

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
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold" htmlFor="product-search">
        {messages.name}
      </label>
      <Field
        id="product-search"
        value={query}
        role="combobox"
        aria-expanded="true"
        aria-controls="product-results"
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul id="product-results" className="overflow-hidden rounded-lg border border-line bg-white">
        {filtered.map((product) => (
          <ListRow key={product.id} ruled>
            <Link href={`/products/${product.id}`} className="flex min-h-12 flex-col justify-center py-2">
              <span className="break-words text-base font-semibold">{product.name}</span>
              <span className="text-sm tabular-nums text-mute">
                {messages.available} {counts.format(product.available)}
              </span>
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
