import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import { ImpeccableLive } from "@/components/impeccable-live";
import { getLocale } from "@/i18n/locale";
import { messagesFor } from "@/i18n/messages";
import "./globals.css";

const noto = Noto_Sans({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "KYZMAT",
  description: "Кардарлар, товар жана жеткирүү",
};

export const viewport: Viewport = {
  themeColor: "#f3f4f6",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = messagesFor(locale);

  return (
    <html lang={locale} className={`${noto.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:bg-sheet focus:px-3 focus:py-2"
        >
          {messages.skip}
        </a>
        {children}
        {/* impeccable-live-start */}
        <ImpeccableLive />
        {/* impeccable-live-end */}
      </body>
    </html>
  );
}
