"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { RatePlaceDialog } from "@/features/places/RatePlaceDialog";
import { Place, ensureSession } from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";

export default function RatePlacePage() {
  const params = useParams<{ id: string }>();
  const placeId = params.id;
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    void ensureSession().then((token) => {
      if (!active) {
        return;
      }
      if (token) {
        setIsAuthenticated(true);
      } else {
        router.replace(loginHrefForReturn(`/places/${placeId}/rate`));
      }
    });
    return () => {
      active = false;
    };
  }, [placeId, router]);

  function closeDialog(place: Place | null) {
    router.push(place ? `/places/${place.id}` : "/places");
  }

  return (
    <main className="dialog-route-shell">
      <RatePlaceDialog onClose={closeDialog} open={isAuthenticated} placeId={placeId} />
    </main>
  );
}
