"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  BidiText,
  BottomSheet,
  Button,
  EmptyState,
  Modal,
  SearchField,
  StatusMessage,
  VisualArtwork
} from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, ListDetail, Place, apiRequest } from "@/lib/api";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";

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
      title="أضف مكانًا"
    >
      <div className="add-place-dialog">
        <SearchField
          id="add-place-search"
          label="بحث"
          onChange={(event) => {
            setQuery(event.target.value);
            setError("");
            setMessage("");
          }}
          onClear={query ? () => setQuery("") : undefined}
          resultCount={normalizedQuery ? results.length : undefined}
          value={query}
        />

        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {!normalizedQuery ? (
          <EmptyState
            title="بحث"
          />
        ) : null}

        {normalizedQuery && results.length === 0 ? (
          <EmptyState
            action={<Link href="/places/new">أضف مكانًا</Link>}
            title="لا يوجد مكان بهذا الاسم"
          />
        ) : null}

        {results.length > 0 ? (
          <div className="stack" aria-label="نتائج الأماكن">
            {results.map((place) => {
              const alreadySaved = savedPlaceIds.includes(place.id);

              return (
                <article className="place-save-dialog__list" key={place.id}>
                  <VisualArtwork id={place.id} label={place.name} type={place.type} variant="mini" />
                  <div>
                    <h3>
                      <BidiText>{place.name}</BidiText>
                    </h3>
                    <p className="muted">
                      {placeTypeLabel(place.type)}
                      {place.subtype ? ` · ${placeSubtypeLabel(place.subtype)}` : ""}
                    </p>
                  </div>
                  <Button
                    disabled={alreadySaved}
                    isLoading={addingPlaceId === place.id}
                    onClick={() => void addPlace(place.id)}
                    type="button"
                    variant={alreadySaved ? "secondary" : "primary"}
                  >
                    {alreadySaved ? "موجود" : "أضف"}
                  </Button>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
