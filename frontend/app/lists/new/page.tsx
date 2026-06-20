"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CreateListDialog } from "@/features/lists/CreateListDialog";
import { getAccessToken } from "@/lib/api";

export default function CreateListPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="dialog-route-shell">
      <CreateListDialog
        onClose={() => router.push("/lists?focus=create-list")}
        open={Boolean(getAccessToken())}
      />
    </main>
  );
}
