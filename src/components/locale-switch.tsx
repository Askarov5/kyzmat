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
    <div className="lang-set shrink-0" role="group" aria-label={messages.language}>
      <form action={switchLocale.bind(null, "ky")}>
        <button type="submit" aria-pressed={locale === "ky"}>
          {messages.kyrgyz}
        </button>
      </form>
      <form action={switchLocale.bind(null, "ru")}>
        <button type="submit" aria-pressed={locale === "ru"}>
          {messages.russian}
        </button>
      </form>
    </div>
  );
}
