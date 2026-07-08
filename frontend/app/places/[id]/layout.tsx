import type { Metadata } from "next";

import { apiBaseUrl } from "@/lib/env";

type PlaceMetadataResponse = {
  description: string | null;
  id: string;
  name: string;
};

const fallbackImage = {
  url: "/icon-512.png",
  width: 512,
  height: 512,
  alt: "شعار سجل"
};

const fallbackMetadata = {
  title: "تفاصيل المكان | سجل",
  description: "استعرض تفاصيل المكان وتقييمه في سجل."
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const place = await fetchPublicPlaceMetadata(id);
  if (!place) {
    return {
      ...fallbackMetadata,
      alternates: { canonical: `/places/${id}` },
      openGraph: {
        ...fallbackMetadata,
        url: `/places/${id}`,
        images: [fallbackImage]
      },
      twitter: {
        card: "summary",
        ...fallbackMetadata,
        images: [fallbackImage.url]
      }
    };
  }

  const description =
    place.description ??
    `استعرض ${place.name} وتقييمات المجتمع واحفظه في قوائمك على سجل.`;
  const title = `${place.name} | سجل`;

  return {
    title,
    description,
    alternates: { canonical: `/places/${place.id}` },
    openGraph: {
      title,
      description,
      url: `/places/${place.id}`,
      images: [fallbackImage]
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [fallbackImage.url]
    }
  };
}

async function fetchPublicPlaceMetadata(id: string): Promise<PlaceMetadataResponse | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/places/${encodeURIComponent(id)}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PlaceMetadataResponse;
  } catch {
    return null;
  }
}

export default function PlaceDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
