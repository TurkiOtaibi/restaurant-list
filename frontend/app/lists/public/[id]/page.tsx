"use client";

import { useParams } from "next/navigation";

import { PublicListDetailPage } from "@/features/lists/PublicListDetailPage";

export default function PublicListDetailRoutePage() {
  const params = useParams<{ id: string }>();

  return <PublicListDetailPage listId={params.id} />;
}
