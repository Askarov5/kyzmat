import type { Locale } from "@/lib/types";

export type PlaceKind = "oblast" | "raion" | "city";

export interface Place {
  id: string;
  kind: PlaceKind;
  nameKy: string;
  nameRu: string;
  parentId?: string;
}

interface PlaceNames {
  id: string;
  nameKy: string;
  nameRu: string;
}

interface RegionNode {
  id: string;
  kind: "oblast" | "city";
  nameKy: string;
  nameRu: string;
  raions: PlaceNames[];
  cities: PlaceNames[];
}

const regions: RegionNode[] = [
  {
    id: "batken",
    kind: "oblast",
    nameKy: "Баткен облусу",
    nameRu: "Баткенская область",
    raions: [
      { id: "batken-raion", nameKy: "Баткен", nameRu: "Баткен" },
      { id: "kadamjay", nameKy: "Кадамжай", nameRu: "Кадамжай" },
      { id: "leilek", nameKy: "Лейлек", nameRu: "Лейлек" },
    ],
    cities: [
      { id: "batken-city", nameKy: "Баткен", nameRu: "Баткен" },
      { id: "kyzyl-kiya", nameKy: "Кызыл-Кыя", nameRu: "Кызыл-Кия" },
      { id: "suluktu", nameKy: "Сүлүктү", nameRu: "Сулюкта" },
    ],
  },
  {
    id: "jalal-abad",
    kind: "oblast",
    nameKy: "Жалал-Абад облусу",
    nameRu: "Джалал-Абадская область",
    raions: [
      { id: "aksy", nameKy: "Аксы", nameRu: "Аксы" },
      { id: "ala-buka", nameKy: "Ала-Бука", nameRu: "Ала-Бука" },
      { id: "bazar-korgon", nameKy: "Базар-Коргон", nameRu: "Базар-Коргон" },
      { id: "nooken", nameKy: "Ноокен", nameRu: "Ноокен" },
      { id: "suzak", nameKy: "Сузак", nameRu: "Сузак" },
      { id: "toguz-toro", nameKy: "Тогуз-Торо", nameRu: "Тогуз-Торо" },
      { id: "toktogul", nameKy: "Токтогул", nameRu: "Токтогул" },
      { id: "chatkal", nameKy: "Чаткал", nameRu: "Чаткал" },
    ],
    cities: [
      { id: "jalal-abad-city", nameKy: "Жалал-Абад", nameRu: "Джалал-Абад" },
      { id: "kara-kol", nameKy: "Кара-Көл", nameRu: "Кара-Куль" },
      { id: "mailuu-suu", nameKy: "Майлуу-Суу", nameRu: "Майлуу-Суу" },
      { id: "tash-komur", nameKy: "Таш-Көмүр", nameRu: "Таш-Кумыр" },
      { id: "kok-jangak", nameKy: "Көк-Жаңгак", nameRu: "Кок-Жангак" },
    ],
  },
  {
    id: "issykkul",
    kind: "oblast",
    nameKy: "Ысык-Көл облусу",
    nameRu: "Иссык-Кульская область",
    raions: [
      { id: "ak-suu", nameKy: "Ак-Суу", nameRu: "Ак-Суу" },
      { id: "jeti-oguz", nameKy: "Жети-Өгүз", nameRu: "Джети-Огуз" },
      { id: "ysyk-kol", nameKy: "Ысык-Көл", nameRu: "Иссык-Куль" },
      { id: "ton", nameKy: "Тоң", nameRu: "Тон" },
      { id: "tup", nameKy: "Түп", nameRu: "Тюп" },
    ],
    cities: [
      { id: "karakol", nameKy: "Каракол", nameRu: "Каракол" },
      { id: "balykchy", nameKy: "Балыкчы", nameRu: "Балыкчы" },
    ],
  },
  {
    id: "naryn",
    kind: "oblast",
    nameKy: "Нарын облусу",
    nameRu: "Нарынская область",
    raions: [
      { id: "ak-talaa", nameKy: "Ак-Талаа", nameRu: "Ак-Талаа" },
      { id: "at-bashy", nameKy: "Ат-Башы", nameRu: "Ат-Баши" },
      { id: "jumgal", nameKy: "Жумгал", nameRu: "Жумгал" },
      { id: "kochkor", nameKy: "Кочкор", nameRu: "Кочкор" },
      { id: "naryn-raion", nameKy: "Нарын", nameRu: "Нарын" },
    ],
    cities: [{ id: "naryn-city", nameKy: "Нарын", nameRu: "Нарын" }],
  },
  {
    id: "osh",
    kind: "oblast",
    nameKy: "Ош облусу",
    nameRu: "Ошская область",
    raions: [
      { id: "alay", nameKy: "Алай", nameRu: "Алай" },
      { id: "aravan", nameKy: "Араван", nameRu: "Араван" },
      { id: "kara-kulja", nameKy: "Кара-Кулжа", nameRu: "Кара-Кульджа" },
      { id: "kara-suu", nameKy: "Кара-Суу", nameRu: "Кара-Суу" },
      { id: "nookat", nameKy: "Ноокат", nameRu: "Ноокат" },
      { id: "uzgen", nameKy: "Өзгөн", nameRu: "Узген" },
      { id: "chong-alay", nameKy: "Чоң-Алай", nameRu: "Чон-Алай" },
    ],
    cities: [],
  },
  {
    id: "talas",
    kind: "oblast",
    nameKy: "Талас облусу",
    nameRu: "Таласская область",
    raions: [
      { id: "bakai-ata", nameKy: "Бакай-Ата", nameRu: "Бакай-Ата" },
      { id: "kara-buura", nameKy: "Кара-Буура", nameRu: "Кара-Буура" },
      { id: "manas", nameKy: "Манас", nameRu: "Манас" },
      { id: "talas-raion", nameKy: "Талас", nameRu: "Талас" },
    ],
    cities: [{ id: "talas-city", nameKy: "Талас", nameRu: "Талас" }],
  },
  {
    id: "chuy",
    kind: "oblast",
    nameKy: "Чүй облусу",
    nameRu: "Чуйская область",
    raions: [
      { id: "alamudun", nameKy: "Аламүдүн", nameRu: "Аламудун" },
      { id: "jayyl", nameKy: "Жайыл", nameRu: "Жайыл" },
      { id: "kemin", nameKy: "Кемин", nameRu: "Кемин" },
      { id: "moskva", nameKy: "Москва", nameRu: "Московский" },
      { id: "panfilov", nameKy: "Панфилов", nameRu: "Панфилов" },
      { id: "sokuluk", nameKy: "Сокулук", nameRu: "Сокулук" },
      { id: "chuy-raion", nameKy: "Чүй", nameRu: "Чуй" },
      { id: "ysyk-ata", nameKy: "Ысык-Ата", nameRu: "Ысык-Ата" },
    ],
    cities: [{ id: "tokmok", nameKy: "Токмок", nameRu: "Токмок" }],
  },
  {
    id: "bishkek",
    kind: "city",
    nameKy: "Бишкек",
    nameRu: "Бишкек",
    raions: [
      { id: "lenin", nameKy: "Ленин", nameRu: "Ленинский" },
      { id: "oktyabr", nameKy: "Октябрь", nameRu: "Октябрьский" },
      { id: "pervomai", nameKy: "Биринчи Май", nameRu: "Первомайский" },
      { id: "sverdlov", nameKy: "Свердлов", nameRu: "Свердловский" },
    ],
    cities: [],
  },
  {
    id: "osh-city",
    kind: "city",
    nameKy: "Ош",
    nameRu: "Ош",
    raions: [],
    cities: [{ id: "osh-city-place", nameKy: "Ош", nameRu: "Ош" }],
  },
];

function regionId(region: RegionNode): string {
  return region.kind === "oblast" ? `oblast-${region.id}` : `city-${region.id}`;
}

export const places: Place[] = regions.flatMap((region) => {
  const id = regionId(region);
  const parent: Place = {
    id,
    kind: region.kind,
    nameKy: region.nameKy,
    nameRu: region.nameRu,
  };

  const raions = region.raions.map((item) => ({
    id: `raion-${item.id}`,
    kind: "raion" as const,
    nameKy: item.nameKy,
    nameRu: item.nameRu,
    parentId: id,
  }));

  const cities = region.cities.map((item) => ({
    id: `city-${item.id}`,
    kind: "city" as const,
    nameKy: item.nameKy,
    nameRu: item.nameRu,
    parentId: id,
  }));

  return [parent, ...raions, ...cities];
});

export function placeById(id: string): Place | undefined {
  return places.find((place) => place.id === id);
}

export function placesIn(parentId: string): Place[] {
  return places.filter((place) => place.parentId === parentId);
}

export function placeTitle(place: Place, locale: Locale): string {
  const name = locale === "ru" ? place.nameRu : place.nameKy;

  if (place.kind === "oblast") {
    return name;
  }

  if (place.kind === "city" && !place.parentId) {
    return locale === "ru" ? name : `${name} шаары`;
  }

  if (place.kind === "city") {
    return locale === "ru" ? name : `${name} шаары`;
  }

  return locale === "ru" ? `${name} район` : `${name} району`;
}
