import type { Metadata } from "next";

import { PlaceLibraryPage } from "@/features/places/PlaceLibraryPage";
import type { PlaceType } from "@/features/places/taxonomy";

const placesDescription =
  "استعرض الأماكن حسب النوع وابحث في سجل المطاعم والمقاهي والآيس كريم.";

export const metadata: Metadata = {
  title: "الأماكن | سجل",
  description: placesDescription,
  alternates: { canonical: "/places" },
  openGraph: {
    title: "الأماكن | سجل",
    description: placesDescription,
    url: "/places",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "شعار سجل" }]
  },
  twitter: {
    card: "summary",
    title: "الأماكن | سجل",
    description: placesDescription,
    images: ["/icon-512.png"]
  }
};

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
