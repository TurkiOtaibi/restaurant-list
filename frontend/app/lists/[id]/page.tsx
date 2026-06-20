"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Badge,
  BidiText,
  Button,
  EmptyState,
  PlaceCard,
  StatusMessage
} from "@/components/ui";
import { AddPlaceDialog } from "@/features/lists/AddPlaceDialog";
import { ListLoadingState } from "@/features/lists/ListLoadingState";
import { VisibilitySelector } from "@/features/lists/VisibilitySelector";
import {
  ApiError,
  ListDetail,
  Place,
  apiCollection,
  apiRequest,
  clearTokens,
  getAccessToken
} from "@/lib/api";

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = params.id;
  const [list, setList] = useState<ListDetail | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibilityMessage, setVisibilityMessage] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);

  const loadDetail = useCallback(async () => {
    setError("");
    setNeedsAuth(false);
    setLoading(true);

    if (!getAccessToken()) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    try {
      const [listResponse, placesResponse] = await Promise.all([
        apiRequest<ListDetail>(`/lists/${listId}`),
        apiCollection<Place>("/places")
      ]);
      setList(listResponse);
      setPlaces(placesResponse.data);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else if (caught instanceof ApiError && caught.status === 404) {
        setError("هذه القائمة خاصة أو غير متاحة.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القائمة.");
      }
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function refreshList() {
    const refreshed = await apiRequest<ListDetail>(`/lists/${listId}`);
    setList(refreshed);
  }

  async function handleRemovePlace(placeId: string) {
    setError("");
    setVisibilityMessage("");
    try {
      await apiRequest(`/lists/${listId}/items/${placeId}`, {
        method: "DELETE"
      });
      await refreshList();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر إخراج المكان.");
    }
  }

  async function handleVisibilityChange(visibility: "public" | "private") {
    if (!list || visibility === list.visibility) {
      return;
    }

    setError("");
    setVisibilityMessage("");
    try {
      const updated = await apiRequest<ListDetail>(`/lists/${listId}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ visibility })
      });
      setList({ ...list, visibility: updated.visibility });
      setVisibilityMessage(`تم تحديث ظهور القائمة إلى ${visibilityLabel(updated.visibility)}.`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر تحديث ظهور القائمة.");
    }
  }

  const placeCount = list?.items.length ?? 0;

  return (
    <main className="content list-detail-page">
      <section className="collection-hero" aria-labelledby="list-detail-title">
        <div className="collection-hero__copy">
          <p className="eyebrow">قائمة</p>
          <h1 id="list-detail-title">
            {list ? <BidiText>{list.name}</BidiText> : "القائمة"}
          </h1>
          {list ? (
            <div className="collection-hero__meta">
              <Badge variant={list.visibility}>{visibilityLabel(list.visibility)}</Badge>
              <span>{placeCountLabel(placeCount)}</span>
            </div>
          ) : null}
          <p className="muted">أماكن محفوظة في هذه القائمة.</p>
        </div>
        <div className="list-detail-header__actions">
          <Button onClick={() => setAddPlaceOpen(true)} type="button">
            أضف مكان
          </Button>
          <Link className="ds-button ds-button--secondary" href="/lists">
            العودة لقوائمي
          </Link>
        </div>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض هذه القائمة. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {loading ? <ListLoadingState count={3} includeHeader label="جاري تحميل القائمة" /> : null}

      {error ? (
        <section className="retry-panel" aria-labelledby="list-error-title">
          <StatusMessage tone="error">
            <span id="list-error-title">{error}</span>
          </StatusMessage>
          <Button onClick={() => void loadDetail()} type="button" variant="secondary">
            حاول مرة أخرى
          </Button>
        </section>
      ) : null}

      {!loading && list ? (
        <>
          <section className="collection-places" aria-labelledby="list-places-title">
            <div className="library-section__header library-section__header--inline">
              <div>
                <p className="eyebrow">الأماكن</p>
                <h2 id="list-places-title">أماكن القائمة</h2>
              </div>
              <Button onClick={() => setAddPlaceOpen(true)} type="button" variant="secondary">
                أضف مكان
              </Button>
            </div>

            {list.items.length === 0 ? (
              <EmptyState
                action={
                  <Button onClick={() => setAddPlaceOpen(true)} type="button">
                    أضف أول مكان
                  </Button>
                }
                body="أضف مكانًا للبدء."
                title="لا توجد أماكن"
              />
            ) : (
              <div className="collection-artifacts" aria-label="أماكن القائمة">
                {list.items.map((item) => (
                  <div className="stack" key={item.id}>
                    <PlaceCard href={`/places/${item.place.id}`} place={item.place} />
                    <div className="actions">
                      <Button
                        aria-label={`إخراج ${item.place.name} من القائمة`}
                        onClick={() => void handleRemovePlace(item.place.id)}
                        type="button"
                        variant="secondary"
                      >
                        إخراج
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="list-settings" aria-labelledby="list-settings-title">
            <div className="library-section__header">
              <p className="eyebrow">الخصوصية</p>
              <h2 id="list-settings-title">ظهور القائمة</h2>
            </div>
            <VisibilitySelector
              name="detail-visibility"
              onChange={(value) => void handleVisibilityChange(value)}
              value={list.visibility}
            />
            {visibilityMessage ? <StatusMessage tone="success">{visibilityMessage}</StatusMessage> : null}
          </section>

          <AddPlaceDialog
            listId={listId}
            onAdded={(updatedList) => setList(updatedList)}
            onClose={() => setAddPlaceOpen(false)}
            open={addPlaceOpen}
            places={places}
            savedPlaceIds={list.items.map((item) => item.place.id)}
          />
        </>
      ) : null}
    </main>
  );
}

function visibilityLabel(visibility: "public" | "private"): string {
  return visibility === "public" ? "عام" : "خاص";
}

function placeCountLabel(count: number): string {
  if (count === 0) {
    return "لا توجد أماكن";
  }

  if (count === 1) {
    return "مكان واحد";
  }

  if (count === 2) {
    return "مكانان";
  }

  return `${count} أماكن`;
}
