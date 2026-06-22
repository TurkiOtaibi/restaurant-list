import { PlaceLibraryPage } from "@/features/places/PlaceLibraryPage";
import type { PlaceType } from "@/features/places/taxonomy";

function resolveType(value: string | string[] | undefined): PlaceType {
  if (value === "cafe" || value === "ice_cream" || value === "restaurant") {
    return value;
  }
  return "restaurant";
}

export default async function PlacesPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const params = await searchParams;
  return <PlaceLibraryPage initialType={resolveType(params.type)} />;
}
