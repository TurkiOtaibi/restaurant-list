"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  AddIcon,
  Badge,
  BidiText,
  Button,
  DeleteIcon,
  EditIcon,
  EmptyState,
  PlaceCard,
  StatusMessage
} from "@/components/ui";
import { AddPlaceDialog } from "@/features/lists/AddPlaceDialog";
import { DeleteListDialog } from "@/features/lists/DeleteListDialog";
import { EditListDialog } from "@/features/lists/EditListDialog";
import { ListLoadingState } from "@/features/lists/ListLoadingState";
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
  const [needsAuth, setNeedsAuth] = useState(false);
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [editListOpen, setEditListOpen] = useState(false);
  const [deleteListOpen, setDeleteListOpen] = useState(false);

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
    try {
      await apiRequest(`/lists/${listId}/items/${placeId}`, {
        method: "DELETE"
      });
      await refreshList();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر إزالة المكان.");
    }
  }

  const placeCount = list?.items.length ?? 0;

  return (
    <main className="content list-detail-page">
      <section className="collection-topbar" aria-labelledby="list-detail-title">
        <div className="collection-topbar__copy">
          <h1 id="list-detail-title">
            {list ? <BidiText>{list.name}</BidiText> : "القائمة"}
          </h1>
          {list ? (
            <div className="collection-topbar__meta">
              <Badge variant={list.visibility}>{visibilityLabel(list.visibility)}</Badge>
              <span>{placeCountLabel(placeCount)}</span>
            </div>
          ) : null}
        </div>
        {list ? (
          <div className="list-detail-header__actions" aria-label="إجراءات القائمة">
            <Button
              aria-label="أضف مكان"
              className="list-action list-action--primary"
              onClick={() => setAddPlaceOpen(true)}
              type="button"
              variant="icon"
            >
              <AddIcon />
            </Button>
            <Button
              aria-label="تعديل القائمة"
              className="list-action"
              onClick={() => setEditListOpen(true)}
              type="button"
              variant="icon"
            >
              <EditIcon />
            </Button>
            <Button
              aria-label="حذف القائمة"
              className="list-action list-action--danger"
              onClick={() => setDeleteListOpen(true)}
              type="button"
              variant="icon"
            >
              <DeleteIcon />
            </Button>
          </div>
        ) : (
          <Link className="text-link" href="/lists">
            قوائمي
          </Link>
        )}
      </section>

      {list ? (
        <>
          <EditListDialog
            list={list}
            onClose={() => setEditListOpen(false)}
            onUpdated={setList}
            open={editListOpen}
          />
          <DeleteListDialog
            list={list}
            onClose={() => setDeleteListOpen(false)}
            open={deleteListOpen}
          />
        </>
      ) : null}

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
          <section className="collection-places collection-places--compact" aria-labelledby="list-places-title">
            <h2 className="sr-only" id="list-places-title">الأماكن</h2>

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
              <div className="collection-list" aria-label="أماكن القائمة">
                {list.items.map((item) => (
                  <article className="collection-list__row" key={item.id}>
                    <PlaceCard compact href={`/places/${item.place.id}`} place={item.place} />
                    <Button
                      aria-label={`إزالة ${item.place.name} من القائمة`}
                      className="collection-list__remove list-action list-action--danger"
                      onClick={() => void handleRemovePlace(item.place.id)}
                      type="button"
                      variant="icon"
                    >
                      <DeleteIcon />
                    </Button>
                  </article>
                ))}
              </div>
            )}
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
  return visibility === "public" ? "عامة" : "خاصة";
}

function placeCountLabel(count: number): string {
  return `${count} مكان`;
}
