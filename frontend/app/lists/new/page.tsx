"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CreateListDialog } from "@/features/lists/CreateListDialog";
import { ensureSession } from "@/lib/api";

export default function CreateListPage() {
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
        router.replace("/login");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="dialog-route-shell">
      <CreateListDialog
        onClose={() => router.push("/lists?focus=create-list")}
        open={isAuthenticated}
      />
    </main>
  );
}
