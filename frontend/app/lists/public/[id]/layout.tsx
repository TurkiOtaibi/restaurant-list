import type { Metadata } from "next";

import { apiBaseUrl } from "@/lib/env";

type PublicListMetadataResponse = {
  id: string;
  name: string;
  ownerDisplayName: string;
  placeCount: number;
};

const fallbackImage = {
  url: "/icon-512.png",
  width: 512,
  height: 512,
  alt: "شعار سجل"
};

const fallbackMetadata = {
  title: "قائمة عامة | سجل",
  description: "استعرض تفاصيل قائمة عامة للأماكن في سجل."
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const list = await fetchPublicListMetadata(id);
  if (!list) {
    return {
      ...fallbackMetadata,
      alternates: { canonical: `/lists/public/${id}` },
      openGraph: {
        ...fallbackMetadata,
        url: `/lists/public/${id}`,
        images: [fallbackImage]
      },
      twitter: {
        card: "summary",
        ...fallbackMetadata,
        images: [fallbackImage.url]
      }
    };
  }

  const title = `${list.name} | سجل`;
  const description = `قائمة ${list.name} بواسطة ${list.ownerDisplayName} تضم ${list.placeCount} أماكن على سجل.`;

  return {
    title,
    description,
    alternates: { canonical: `/lists/public/${list.id}` },
    openGraph: {
      title,
      description,
      url: `/lists/public/${list.id}`,
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

async function fetchPublicListMetadata(id: string): Promise<PublicListMetadataResponse | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/lists/public/${encodeURIComponent(id)}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PublicListMetadataResponse;
  } catch {
    return null;
  }
}

export default function PublicListDetailLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
