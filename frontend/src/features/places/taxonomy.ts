import type { Place } from "@/lib/api";

export type PlaceType = Place["type"];
export type PlaceSubtype = NonNullable<Place["subtype"]>;

export const PLACE_TYPES: readonly PlaceType[] = ["restaurant", "cafe", "ice_cream"];

export const placeTypeOptions: Array<{ label: string; value: PlaceType }> = [
  { label: "المطاعم", value: "restaurant" },
  { label: "المقاهي", value: "cafe" },
  { label: "الآيس كريم", value: "ice_cream" }
];

export const createPlaceTypeOptions: Array<{ label: string; value: PlaceType }> = [
  { label: "مطعم", value: "restaurant" },
  { label: "مقهى", value: "cafe" },
  { label: "آيس كريم", value: "ice_cream" }
];

export const restaurantSubtypeOptions: Array<{ label: string; value: PlaceSubtype }> = [
  { label: "برجر", value: "burger" },
  { label: "إيطالي", value: "italian" },
  { label: "أمريكي", value: "american" },
  { label: "ستيك", value: "steak" },
  { label: "مشويات", value: "grill" },
  { label: "شاورما", value: "shawarma" },
  { label: "سعودي", value: "saudi" },
  { label: "خليجي", value: "gulf" },
  { label: "هندي", value: "indian" },
  { label: "آسيوي", value: "asian" },
  { label: "بحري", value: "seafood" },
  { label: "فطور", value: "breakfast" },
  { label: "صحي", value: "healthy" },
  { label: "أخرى", value: "other" }
];

export const cafeSubtypeOptions: Array<{ label: string; value: PlaceSubtype }> = [
  { label: "قهوة", value: "coffee" },
  { label: "شاهي", value: "tea" }
];

export type SubtypeFilterValue = PlaceSubtype | "all";

export const allSubtypeOption: { label: string; value: "all" } = {
  label: "الكل",
  value: "all"
};

const subtypeOptionsByType: Record<
  PlaceType,
  Array<{ label: string; value: SubtypeFilterValue }>
> = {
  cafe: [allSubtypeOption, ...cafeSubtypeOptions],
  ice_cream: [],
  restaurant: [allSubtypeOption, ...restaurantSubtypeOptions]
};

const placeSubtypeLabels = new Map<PlaceSubtype, string>(
  [...restaurantSubtypeOptions, ...cafeSubtypeOptions].map((option) => [
    option.value,
    option.label
  ])
);

export function subtypeOptionsForType(
  type: PlaceType
): Array<{ label: string; value: SubtypeFilterValue }> {
  return [...subtypeOptionsByType[type]];
}

export function isSubtypeValidForType(type: PlaceType, subtype: SubtypeFilterValue): boolean {
  if (subtype === "all") {
    return true;
  }

  return subtypeOptionsForType(type).some((option) => option.value === subtype);
}

export function placeTypeLabel(type: PlaceType): string {
  if (type === "restaurant") {
    return "مطعم";
  }

  if (type === "cafe") {
    return "مقهى";
  }

  return "آيس كريم";
}

export function parsePlaceType(value: string | null): PlaceType | null {
  return value && PLACE_TYPES.includes(value as PlaceType) ? (value as PlaceType) : null;
}

export function placeSubtypeLabel(subtype: Place["subtype"]): string | null {
  if (!subtype) {
    return null;
  }

  return placeSubtypeLabels.get(subtype) ?? null;
}
