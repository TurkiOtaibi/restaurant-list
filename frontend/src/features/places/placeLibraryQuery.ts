import { isSubtypeValidForType, PlaceType, SubtypeFilterValue } from "./taxonomy";

type PlaceLibraryApiQuery = {
  limit: number;
  offset: number;
  q: string;
  subtype: SubtypeFilterValue;
  type: PlaceType;
};

type PlaceLibraryUrlState = {
  focusCreatePlace: boolean;
  q: string;
  subtype: SubtypeFilterValue;
  type: PlaceType;
};

const URL_PLACE_TYPES: readonly PlaceType[] = ["restaurant", "cafe", "ice_cream"];

export function parsePlaceLibraryUrlState(
  search: string,
  initialType: PlaceType
): PlaceLibraryUrlState {
  const params = new URLSearchParams(search);
  const type = parsePlaceType(params.get("type")) ?? initialType;
  const subtype = parseSubtype(type, params.get("subtype"));

  return {
    focusCreatePlace: params.get("focus") === "create-place",
    q: params.get("q") ?? "",
    subtype,
    type
  };
}

export function buildPlaceLibraryApiQuery({
  limit,
  offset,
  q,
  subtype,
  type
}: PlaceLibraryApiQuery): string {
  const params = new URLSearchParams({ type });
  const normalizedSearch = q.trim();
  if (normalizedSearch) {
    params.set("q", normalizedSearch);
  }
  if (subtype !== "all" && type !== "ice_cream") {
    params.set("subtype", subtype);
  }
  params.set("sort", "rating_desc");
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return params.toString();
}

export function buildPlaceLibraryUrl({
  q,
  subtype,
  type
}: Pick<PlaceLibraryUrlState, "q" | "subtype" | "type">): string {
  const params = new URLSearchParams();
  params.set("type", type);
  if (subtype !== "all" && type !== "ice_cream") {
    params.set("subtype", subtype);
  }
  if (q.trim()) {
    params.set("q", q.trim());
  }
  return `/places?${params.toString()}`;
}

function parsePlaceType(type: string | null): PlaceType | null {
  return type && URL_PLACE_TYPES.includes(type as PlaceType) ? (type as PlaceType) : null;
}

function parseSubtype(type: PlaceType, subtype: string | null): SubtypeFilterValue {
  if (subtype && isSubtypeValidForType(type, subtype as SubtypeFilterValue)) {
    return subtype as SubtypeFilterValue;
  }

  return "all";
}
