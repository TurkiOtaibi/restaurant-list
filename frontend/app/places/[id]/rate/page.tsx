"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { RatePlaceDialog } from "@/features/places/RatePlaceDialog";
import { Place, getAccessToken } from "@/lib/api";

export default function RatePlacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  function closeDialog(place: Place | null) {
    router.push(place ? `/places/${place.id}` : "/places");
  }

  return (
    <main className="dialog-route-shell">
      <RatePlaceDialog onClose={closeDialog} open={isAuthenticated} placeId={params.id} />
    </main>
  );
}
