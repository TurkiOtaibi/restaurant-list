"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  BidiText,
  BottomSheet,
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PlaceTypeIcon,
  SearchField,
  StatusMessage
} from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, ListDetail, Place, apiCollection, apiRequest } from "@/lib/api";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";

type AddPlaceDialogProps = {
  listId: string;
  onAdded: (list: ListDetail) => void;
  onClose: () => void;
  open: boolean;
  savedPlaceIds?: string[];
};

export function AddPlaceDialog({
  listId,
  onAdded,
  onClose,
  open,
  savedPlaceIds = []
}: AddPlaceDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!open) {
      setLoadingResults(false);
      return;
    }

    if (!normalizedQuery) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    setLoadingResults(true);
    setError("");

    const params = new URLSearchParams({
      limit: "20",
      q: normalizedQuery,
      sort: "rating_desc"
    });

    apiCollection<Place>(`/places?${params.toString()}`)
      .then((response) => {
        if (requestId === requestIdRef.current) {
          setResults(response.data);
        }
      })
      .catch((caught) => {
        if (requestId === requestIdRef.current) {
          setResults([]);
          setError(caught instanceof ApiError ? caught.message : "تعذر البحث عن الأماكن.");
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setLoadingResults(false);
        }
      });
  }, [normalizedQuery, open]);

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
      setError(caught instanceof ApiError ? caught.message : "تعذر إضافة المكان.");
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
          resultCount={normalizedQuery && !loadingResults ? results.length : undefined}
          value={query}
        />

        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {!normalizedQuery ? (
          <EmptyState
            title="بحث"
          />
        ) : null}

        {loadingResults ? <LoadingState count={2} delayMs={0} label="جاري البحث عن الأماكن" /> : null}

        {normalizedQuery && !loadingResults && results.length === 0 ? (
          <EmptyState
            action={
              <Link className="ds-button" href={`/places/new?name=${encodeURIComponent(query.trim())}`}>
                إضافة مكان جديد
              </Link>
            }
            title="لم تجد المكان؟"
          />
        ) : null}

        {!loadingResults && results.length > 0 ? (
          <div className="stack" aria-label="نتائج الأماكن">
            {results.map((place) => {
              const alreadySaved = savedPlaceIds.includes(place.id);

              return (
                <article className="place-save-dialog__list" key={place.id}>
                  <PlaceTypeIcon type={place.type} />
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
