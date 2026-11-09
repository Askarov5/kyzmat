"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@/components/combobox";
import type { Messages } from "@/i18n/types";
import { placeById, placeTitle, places, placesIn, type Place } from "@/lib/places";
import type { Locale } from "@/lib/types";

interface PlaceFieldsProps {
  messages: Messages;
  locale: Locale;
  required?: boolean;
  initialLocalityKy?: string | null;
}

function toOptions(items: Place[], locale: Locale) {
  const collator = locale === "ru" ? "ru" : "ky";

  return items
    .map((place) => ({
      id: place.id,
      label: placeTitle(place, locale),
      filterText: `${place.nameKy} ${place.nameRu}`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, collator));
}

function initialFromLocalityKy(nameKy: string | null | undefined): {
  oblastId: string;
  localityId: string;
} {
  if (!nameKy) {
    return { oblastId: "", localityId: "" };
  }

  const matches = places.filter((place) => place.nameKy === nameKy);
  const child = matches.find((place) => place.parentId) ?? matches[0];
  if (!child?.parentId) {
    return { oblastId: child?.id ?? "", localityId: child?.id ?? "" };
  }

  return { oblastId: child.parentId, localityId: child.id };
}

export function PlaceFields({
  messages,
  locale,
  required = true,
  initialLocalityKy = null,
}: PlaceFieldsProps) {
  const seeded = initialFromLocalityKy(initialLocalityKy);
  const [oblastId, setOblastId] = useState(seeded.oblastId);
  const oblasts = useMemo(
    () => toOptions(places.filter((place) => !place.parentId), locale),
    [locale],
  );
  const raions = useMemo(() => toOptions(placesIn(oblastId), locale), [locale, oblastId]);
  const initialLocalityStillValid =
    seeded.localityId && placeById(seeded.localityId)?.parentId === oblastId
      ? seeded.localityId
      : "";

  return (
    <>
      <Combobox
        name="oblastId"
        label={messages.oblast}
        placeholder={messages.pickOblast}
        emptyLabel={messages.noMatch}
        options={oblasts}
        required={required}
        initialId={seeded.oblastId}
        onPick={(id) => setOblastId(id)}
      />
      <Combobox
        key={oblastId || "raion"}
        name="localityId"
        label={messages.raion}
        placeholder={messages.pickRaion}
        emptyLabel={messages.noMatch}
        options={raions}
        required={required}
        disabled={!oblastId}
        initialId={initialLocalityStillValid}
        startOpen={Boolean(oblastId) && !initialLocalityStillValid}
      />
    </>
  );
}
