"use client";

import { useParams } from "next/navigation";

import { PlaceDetailPage } from "@/features/places/PlaceDetailPage";

export default function PlacePage() {
  const params = useParams<{ id: string }>();

  return <PlaceDetailPage placeId={params.id} />;
}
