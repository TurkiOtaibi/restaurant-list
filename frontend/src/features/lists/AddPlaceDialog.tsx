"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  BottomSheet,
  Button,
  EmptyState,
  Modal,
  PlaceCard,
  SearchField,
  StatusMessage
} from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, ListDetail, Place, apiRequest } from "@/lib/api";

type AddPlaceDialogProps = {
  listId: string;
  onAdded: (list: ListDetail) => void;
  onClose: () => void;
  open: boolean;
  places: Place[];
  savedPlaceIds?: string[];
};

export function AddPlaceDialog({
  listId,
  onAdded,
  onClose,
  open,
  places,
  savedPlaceIds = []
}: AddPlaceDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const [query, setQuery] = useState("");
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return places.filter((place) => place.name.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, places]);

  async function addPlace(placeId: string) {
    setError("");
    setMessage("");
    setAddingPlaceId(placeId);
    try {
      await apiRequest(`/lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify({ placeId })
      });
      const refreshed = await apiRequest<ListDetail>(`/lists/${listId}`);
      onAdded(refreshed);
      setMessage("تمت إضافة المكان إلى القائمة.");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setMessage("المكان موجود في هذه القائمة.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر إضافة المكان.");
      }
    } finally {
      setAddingPlaceId(null);
    }
  }

  return (
    <Dialog
      initialFocusSelector="#add-place-search"
      labelledBy="add-place-title"
      onClose={onClose}
      open={open}
      title="أضف مكان"
    >
      <div className="add-place-dialog">
        <SearchField
          id="add-place-search"
          label="ابحث باسم المكان"
          onChange={(event) => {
            setQuery(event.target.value);
            setError("");
            setMessage("");
          }}
          onClear={query ? () => setQuery("") : undefined}
          resultCount={normalizedQuery ? results.length : undefined}
          scopeLabel="ابحث بالاسم فقط."
          value={query}
        />

        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {!normalizedQuery ? (
          <EmptyState
            body="اكتب اسم مطعم أو مقهى موجود لحفظه في هذه القائمة."
            title="ابحث باسم المكان"
          />
        ) : null}

        {normalizedQuery && results.length === 0 ? (
          <EmptyState
            action={<Link href="/places/new">أضف مكان</Link>}
            body="يمكنك إنشاء المكان إذا لم يكن موجودًا بعد."
            title="لا يوجد مكان بهذا الاسم"
          />
        ) : null}

        {results.length > 0 ? (
          <div className="stack" aria-label="نتائج الأماكن">
            {results.map((place) => {
              const alreadySaved = savedPlaceIds.includes(place.id);

              return (
                <PlaceCard
                  actions={
                    <Button
                      disabled={alreadySaved}
                      isLoading={addingPlaceId === place.id}
                      onClick={() => void addPlace(place.id)}
                      type="button"
                      variant={alreadySaved ? "secondary" : "primary"}
                    >
                      {alreadySaved ? "موجود" : "أضف"}
                    </Button>
                  }
                  key={place.id}
                  place={place}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
