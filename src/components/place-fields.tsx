"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@/components/combobox";
import type { Messages } from "@/i18n/types";
import { placeTitle, places, placesIn, type Place } from "@/lib/places";
import type { Locale } from "@/lib/types";

interface PlaceFieldsProps {
  messages: Messages;
  locale: Locale;
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

export function PlaceFields({ messages, locale }: PlaceFieldsProps) {
  const [oblastId, setOblastId] = useState("");
  const oblasts = useMemo(
    () => toOptions(places.filter((place) => !place.parentId), locale),
    [locale],
  );
  const raions = useMemo(() => toOptions(placesIn(oblastId), locale), [locale, oblastId]);

  return (
    <>
      <Combobox
        name="oblastId"
        label={messages.oblast}
        placeholder={messages.pickOblast}
        emptyLabel={messages.noMatch}
        options={oblasts}
        required
        onPick={setOblastId}
      />
      <Combobox
        key={oblastId || "raion"}
        name="localityId"
        label={messages.raion}
        placeholder={messages.pickRaion}
        emptyLabel={messages.noMatch}
        options={raions}
        required
        disabled={!oblastId}
        startOpen={Boolean(oblastId)}
      />
    </>
  );
}
