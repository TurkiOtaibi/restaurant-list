"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AddIcon,
  ActionMenu,
  Badge,
  BidiText,
  Button,
  EmptyState,
  PlaceCard,
  StatusMessage,
  Toast,
  VirtualList
} from "@/components/ui";
import { AddPlaceDialog } from "@/features/lists/AddPlaceDialog";
import { DeleteListDialog } from "@/features/lists/DeleteListDialog";
import { EditListDialog } from "@/features/lists/EditListDialog";
import { ListLoadingState } from "@/features/lists/ListLoadingState";
import {
  ApiError,
  ListDetail,
  ListItem,
  apiRequest,
  clearTokens,
  ensureSession,
  isSessionRecoveryError
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";
import { listVisibilityLabel } from "@/lib/listVisibility";
import { placeCountLabel } from "@/lib/numerals";

// How long the undo affordance stays available after a removal. This is a
// product/implementation-owned value (LIST-010-XC-005); after it elapses the
// removal is final.
const UNDO_WINDOW_MS = 7000;

type PendingUndo = {
  placeId: string;
  placeName: string;
};

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const listId = params.id;
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [editListOpen, setEditListOpen] = useState(false);
  const [deleteListOpen, setDeleteListOpen] = useState(false);
  const [undo, setUndo] = useState<PendingUndo | null>(null);
  const [undoError, setUndoError] = useState("");
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoBarRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    setError("");
    setNeedsAuth(false);
    setLoading(true);

    try {
      if (!(await ensureSession())) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const listResponse = await apiRequest<ListDetail>(`/lists/${listId}`);
      setList(listResponse);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else if (caught instanceof ApiError && caught.status === 404) {
        setError("هذه القائمة خاصة أو غير متاحة.");
      } else if (isSessionRecoveryError(caught)) {
        setError("تعذر استعادة الجلسة. حاول مرة أخرى.");
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

  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearUndoTimer, [clearUndoTimer]);

  // Move focus to the undo control when it appears so a keyboard user who just
  // removed a row is not dropped to the document body (LIST-010-US-014-TC-003).
  useEffect(() => {
    if (undo) {
      undoBarRef.current?.querySelector<HTMLButtonElement>(".list-undo-toast__action")?.focus();
    }
  }, [undo]);

  async function refreshList() {
    const refreshed = await apiRequest<ListDetail>(`/lists/${listId}`);
    setList(refreshed);
  }

  async function handleRemovePlace(item: ListItem) {
    setError("");
    setUndoError("");
    try {
      await apiRequest(`/lists/${listId}/items/${item.place.id}`, { method: "DELETE" });
      // Non-optimistic removal: the row stays until the server confirms, then we
      // drop it locally and offer undo. placeCount derives from items length.
      setList((previous) =>
        previous
          ? { ...previous, items: previous.items.filter((entry) => entry.id !== item.id) }
          : previous
      );
      clearUndoTimer();
      setUndo({ placeId: item.place.id, placeName: item.place.name });
      undoTimerRef.current = setTimeout(() => {
        undoTimerRef.current = null;
        setUndo(null);
      }, UNDO_WINDOW_MS);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر إزالة المكان.");
    }
  }

  async function handleUndo() {
    if (!undo) {
      return;
    }
    const { placeId } = undo;
    clearUndoTimer();
    setUndoError("");
    try {
      await apiRequest(`/lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify({ placeId })
      });
      await refreshList();
      setUndo(null);
    } catch (caught) {
      setUndoError(caught instanceof ApiError ? caught.message : "تعذر التراجع عن الإزالة.");
    }
  }

  const placeCount = list?.items.length ?? 0;
  const listMenuItems = list
    ? [
        { label: "تعديل", onSelect: () => setEditListOpen(true) },
        ...(list.isSystem
          ? []
          : [
              {
                destructive: true,
                label: "حذف",
                onSelect: () => setDeleteListOpen(true)
              }
            ])
      ]
    : [];

  return (
    <main className="content list-detail-page">
      <section className="collection-topbar" aria-labelledby="list-detail-title">
        <div className="collection-topbar__copy">
          <h1 id="list-detail-title">
            {list ? <BidiText>{list.name}</BidiText> : "القائمة"}
          </h1>
          {list ? (
            <div className="collection-topbar__meta">
              <Badge variant={list.visibility}>{listVisibilityLabel(list.visibility)}</Badge>
              {list.isSystem ? <Badge>نظامية</Badge> : null}
              <span>{placeCountLabel(placeCount)}</span>
            </div>
          ) : null}
        </div>
        {list ? (
          <div className="list-detail-header__actions" aria-label="إجراءات القائمة">
            <Button
              aria-label="أضف مكانًا"
              className="list-action list-action--primary"
              onClick={() => setAddPlaceOpen(true)}
              type="button"
              variant="icon"
            >
              <AddIcon />
            </Button>
            <ActionMenu
              items={listMenuItems}
              label="إجراءات القائمة"
            />
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
          سجّل الدخول لعرض هذه القائمة. <Link href={loginHrefForReturn(`/lists/${listId}`)}>تسجيل الدخول</Link>
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
              <VirtualList
                ariaLabel="أماكن القائمة"
                className="collection-list"
                gap={8}
                getKey={(item) => item.id}
                items={list.items}
                renderItem={(item) => (
                  <article className="collection-list__row">
                    <PlaceCard compact href={`/places/${item.place.id}`} place={item.place} />
                    <ActionMenu
                      items={[
                        {
                          destructive: true,
                          label: "إزالة",
                          onSelect: () => void handleRemovePlace(item)
                        }
                      ]}
                      label={`إجراءات ${item.place.name}`}
                    />
                  </article>
                )}
              />
            )}
          </section>

          <AddPlaceDialog
            listId={listId}
            onAdded={(updatedList) => setList(updatedList)}
            onClose={() => setAddPlaceOpen(false)}
            open={addPlaceOpen}
            savedPlaceIds={list.items.map((item) => item.place.id)}
          />
        </>
      ) : null}

      {undo ? (
        <div className="list-undo-toast" ref={undoBarRef}>
          <div className="list-undo-toast__bar">
            <Toast tone={undoError ? "error" : "success"}>
              <span>{undoError ? undoError : `تمت إزالة ${undo.placeName} من القائمة.`}</span>
            </Toast>
            <Button
              aria-label={`تراجع عن إزالة ${undo.placeName}`}
              className="list-undo-toast__action"
              onClick={() => void handleUndo()}
              type="button"
              variant="secondary"
            >
              تراجع
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

