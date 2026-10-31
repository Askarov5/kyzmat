import { LocaleSwitch } from "@/components/locale-switch";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";

export default async function SetupPage() {
  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <LocaleSwitch locale={locale} messages={messages} />
      <h1 className="text-pretty text-3xl font-semibold">{messages.setupTitle}</h1>
      <p className="text-pretty text-base leading-7">{messages.setupBody}</p>
    </main>
  );
}
