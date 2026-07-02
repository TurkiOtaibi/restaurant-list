"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { StatusMessage } from "@/components/ui";
import { CreatePlaceDialog } from "@/features/places/CreatePlaceDialog";
import { parsePlaceType, type PlaceType } from "@/features/places/taxonomy";
import { ensureSession, isSessionRecoveryError } from "@/lib/api";
import { currentReturnPath, loginHrefForReturn } from "@/lib/authReturn";

export default function CreatePlacePage() {
  const router = useRouter();
  const [initialType] = useState<PlaceType>(initialTypeFromUrl);
  const [initialName] = useState<string>(initialNameFromUrl);
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
          router.replace(loginHrefForReturn(currentReturnPath()));
        }
      })
      .catch((caught) => {
        if (!active) {
          return;
        }
        if (isSessionRecoveryError(caught)) {
          setSessionError("تعذر استعادة الجلسة. حاول مرة أخرى.");
        } else {
          router.replace(loginHrefForReturn(currentReturnPath()));
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
      {sessionError ? <StatusMessage tone="error">{sessionError}</StatusMessage> : null}
      <CreatePlaceDialog
        initialName={initialName}
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

  return parsePlaceType(new URLSearchParams(window.location.search).get("type")) ?? "restaurant";
}

function initialNameFromUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("name")?.slice(0, 120) ?? "";
}
