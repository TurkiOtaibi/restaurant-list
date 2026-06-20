"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CreatePlaceDialog } from "@/features/places/CreatePlaceDialog";
import { getAccessToken } from "@/lib/api";

type PlaceType = "restaurant" | "cafe";

export default function CreatePlacePage() {
  const router = useRouter();
  const [initialType] = useState<PlaceType>(initialTypeFromUrl);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  function closeDialog(type: PlaceType) {
    router.push(type === "cafe" ? "/cafes?focus=create-place" : "/restaurants?focus=create-place");
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

  return new URLSearchParams(window.location.search).get("type") === "cafe" ? "cafe" : "restaurant";
}
