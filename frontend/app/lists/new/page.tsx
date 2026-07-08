"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { StatusMessage } from "@/components/ui";
import { CreateListDialog } from "@/features/lists/CreateListDialog";
import { ensureSession, isSessionRecoveryError } from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";

export default function CreateListPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionError, setSessionError] = useState("");
  function closeCreateListDialog() {
    setIsAuthenticated(false);
    window.location.href = "/lists?focus=create-list";
  }

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
          router.replace(loginHrefForReturn("/lists/new"));
        }
      })
      .catch((caught) => {
        if (!active) {
          return;
        }
        if (isSessionRecoveryError(caught)) {
          setSessionError("تعذر استعادة الجلسة. حاول مرة أخرى.");
        } else {
          router.replace(loginHrefForReturn("/lists/new"));
        }
      });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="dialog-route-shell">
      {sessionError ? <StatusMessage tone="error">{sessionError}</StatusMessage> : null}
      <CreateListDialog
        onClose={closeCreateListDialog}
        open={isAuthenticated}
      />
    </main>
  );
}
