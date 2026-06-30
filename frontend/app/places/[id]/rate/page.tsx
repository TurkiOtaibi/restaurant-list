"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { StatusMessage } from "@/components/ui";
import { RatePlaceDialog } from "@/features/places/RatePlaceDialog";
import { Place, ensureSession, isSessionRecoveryError } from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";

export default function RatePlacePage() {
  const params = useParams<{ id: string }>();
  const placeId = params.id;
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;
    void ensureSession()
      .then((token) => {
        if (!active) {
          return;
        }
        if (token) {
          setSessionError("");
          setIsAuthenticated(true);
        } else {
          router.replace(loginHrefForReturn(`/places/${placeId}/rate`));
        }
      })
      .catch((caught) => {
        if (!active) {
          return;
        }
        if (isSessionRecoveryError(caught)) {
          setSessionError("تعذر استعادة الجلسة. حاول مرة أخرى.");
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
      {sessionError ? <StatusMessage tone="error">{sessionError}</StatusMessage> : null}
      <RatePlaceDialog onClose={closeDialog} open={isAuthenticated} placeId={placeId} />
    </main>
  );
}
