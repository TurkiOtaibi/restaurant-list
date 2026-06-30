"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { AddIcon, Button, EmptyState, ListCard, StatusMessage } from "@/components/ui";
import { ListLoadingState } from "@/features/lists/ListLoadingState";
import {
  ApiError,
  ListDetail,
  UserList,
  apiCollection,
  clearTokens,
  ensureSession,
  isSessionRecoveryError
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";
import { listCountLabel, placeCountLabel } from "@/lib/numerals";

export default function ListsPage() {
  const createLinkRef = useRef<HTMLAnchorElement>(null);
  const [lists, setLists] = useState<ListDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadLists = useCallback(async () => {
    setError("");
    setNeedsAuth(false);
    setLoading(true);

    try {
      if (!(await ensureSession())) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const response = await apiCollection<UserList>("/lists");
      setLists(response.data.map((list) => ({ ...list, items: [] })));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else if (isSessionRecoveryError(caught)) {
        setError("تعذر استعادة الجلسة. حاول مرة أخرى.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القوائم.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  useEffect(() => {
    const focusTarget = new URLSearchParams(window.location.search).get("focus");
    if (focusTarget === "create-list") {
      createLinkRef.current?.focus();
    }
  }, []);

  const totalPlaces = lists.reduce((sum, list) => sum + list.placeCount, 0);

  return (
    <main className="content library-page">
      <section className="lists-topbar" aria-labelledby="my-lists-title">
        <div className="lists-topbar__copy">
          <h1 id="my-lists-title">قوائمي</h1>
          {!loading && !needsAuth && !error && lists.length > 0 ? (
            <p className="muted">{listCountLabel(lists.length)} · {placeCountLabel(totalPlaces)}</p>
          ) : null}
        </div>
        <Link
          aria-label="أضف قائمة"
          className="ds-button ds-button--icon lists-topbar__add"
          href="/lists/new"
          ref={createLinkRef}
        >
          <AddIcon />
        </Link>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض القوائم. <Link href={loginHrefForReturn("/lists")}>تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {loading ? <ListLoadingState count={3} label="جاري تحميل القوائم" /> : null}

      {error ? (
        <section className="retry-panel" aria-labelledby="lists-error-title">
          <StatusMessage tone="error">
            <span id="lists-error-title">{error}</span>
          </StatusMessage>
          <Button onClick={() => void loadLists()} type="button" variant="secondary">
            حاول مرة أخرى
          </Button>
        </section>
      ) : null}

      {!loading && !needsAuth && !error && lists.length === 0 ? (
        <EmptyState
          action={
            <div className="empty-actions">
              <Link className="ds-button" href="/lists/new">
                أنشئ أول قائمة
              </Link>
              <Link className="text-link" href="/lists/public">
                استكشف القوائم العامة <span aria-hidden="true">{"\u2190"}</span>
              </Link>
            </div>
          }
          body="ابدأ بقائمة واحدة."
          title="لا توجد قوائم"
        />
      ) : null}

      {!loading && !needsAuth && !error && lists.length > 0 ? (
        <section className="lists-compact-section" aria-labelledby="library-lists-title">
          <h2 className="sr-only" id="library-lists-title">القوائم</h2>
          <div aria-label="قوائمي" className="library-grid library-grid--compact">
            {lists.map((list) => (
              <ListCard
                href={`/lists/${list.id}`}
                isEmpty={list.placeCount === 0}
                key={list.id}
                list={list}
                placeCount={list.placeCount}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !needsAuth && !error && lists.length > 0 ? (
        <div className="public-lists-entry-compact">
          <Link href="/lists/public">
            استكشف القوائم العامة <span aria-hidden="true">{"\u2190"}</span>
          </Link>
        </div>
      ) : null}
    </main>
  );
}
