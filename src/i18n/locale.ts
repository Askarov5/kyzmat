import { cookies } from "next/headers";
import type { Locale } from "@/lib/types";

export const LOCALE_COOKIE = "kyzmat-locale";

export function parseLocale(value: string | undefined): Locale {
  return value === "ru" ? "ru" : "ky";
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
