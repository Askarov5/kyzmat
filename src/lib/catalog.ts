import type { Locale } from "@/lib/types";

export interface CatalogLabel {
  id: string;
  nameKy: string;
  nameRu: string;
}

export const units: CatalogLabel[] = [
  { id: "piece", nameKy: "даана", nameRu: "штука" },
  { id: "liter", nameKy: "литр", nameRu: "литр" },
  { id: "drum", nameKy: "челек", nameRu: "бочка" },
];

export const intervals: { days: number; nameKy: string; nameRu: string }[] = [
  { days: 14, nameKy: "2 жума", nameRu: "2 недели" },
  { days: 30, nameKy: "1 ай", nameRu: "1 месяц" },
  { days: 90, nameKy: "3 ай", nameRu: "3 месяца" },
  { days: 180, nameKy: "6 ай", nameRu: "6 месяцев" },
  { days: 365, nameKy: "12 ай", nameRu: "12 месяцев" },
];

const intervalDays = new Set(intervals.map((interval) => interval.days));

export function catalogTitle(item: { nameKy: string; nameRu: string }, locale: Locale): string {
  return locale === "ru" ? item.nameRu : item.nameKy;
}

export function unitTitle(unit: string, locale: Locale): string {
  const known = units.find((item) => item.id === unit);
  return known ? catalogTitle(known, locale) : unit;
}

export function intervalTitle(days: number, locale: Locale): string | null {
  const known = intervals.find((item) => item.days === days);
  return known ? catalogTitle(known, locale) : null;
}

export function optionalInterval(value: FormDataEntryValue | null): number | null | "invalid" {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const days = Number(raw);

  if (!intervalDays.has(days)) {
    return "invalid";
  }

  return days;
}

export function optionalUnit(picked: string, added: string): string | null | "invalid" {
  const unit = added.trim() || picked.trim();

  if (!unit) {
    return null;
  }

  if (unit.length > 40) {
    return "invalid";
  }

  return unit;
}
