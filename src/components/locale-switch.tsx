"use client";

import { switchLocale } from "@/app/actions/session";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface LocaleSwitchProps {
  locale: Locale;
  messages: Messages;
}

export function LocaleSwitch({ locale, messages }: LocaleSwitchProps) {
  return (
    <div className="flex gap-2" role="group" aria-label={messages.language}>
      <form action={switchLocale.bind(null, "ky")}>
        <button
          type="submit"
          className={`min-h-12 px-4 text-sm font-semibold ${locale === "ky" ? "bg-stamp text-white" : "bg-sheet ring-1 ring-line"}`}
          aria-pressed={locale === "ky"}
        >
          {messages.kyrgyz}
        </button>
      </form>
      <form action={switchLocale.bind(null, "ru")}>
        <button
          type="submit"
          className={`min-h-12 px-4 text-sm font-semibold ${locale === "ru" ? "bg-stamp text-white" : "bg-sheet ring-1 ring-line"}`}
          aria-pressed={locale === "ru"}
        >
          {messages.russian}
        </button>
      </form>
    </div>
  );
}
