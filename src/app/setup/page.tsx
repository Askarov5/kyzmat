import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";

export default async function SetupPage() {
  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <PageFrame locale={locale} messages={messages}>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.setupTitle}</h1>
      <p className="mt-4 max-w-[36ch] text-pretty text-base leading-7 text-mute">{messages.setupBody}</p>
    </PageFrame>
  );
}
