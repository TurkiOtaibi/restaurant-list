"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CreatePlaceDialog } from "@/features/places/CreatePlaceDialog";
import type { PlaceType } from "@/features/places/taxonomy";
import { ensureSession } from "@/lib/api";

export default function CreatePlacePage() {
  const router = useRouter();
  const [initialType] = useState<PlaceType>(initialTypeFromUrl);
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
        router.replace("/login");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  function closeDialog(type: PlaceType) {
    router.push(`/places?type=${type}&focus=create-place`);
  }

  return (
    <main className="dialog-route-shell">
      <CreatePlaceDialog
        initialType={initialType}
        onClose={closeDialog}
        open={isAuthenticated}
      />
    </main>
  );
}

function initialTypeFromUrl(): PlaceType {
  if (typeof window === "undefined") {
    return "restaurant";
  }

  const type = new URLSearchParams(window.location.search).get("type");
  if (type === "cafe" || type === "ice_cream") {
    return type;
  }

  return "restaurant";
}
