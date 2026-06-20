"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, EmptyState, ListCard, StatusMessage } from "@/components/ui";
import { ListLoadingState } from "@/features/lists/ListLoadingState";
import {
  ApiError,
  ListDetail,
  UserList,
  apiCollection,
  clearTokens,
  getAccessToken
} from "@/lib/api";

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

    if (!getAccessToken()) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    try {
      const response = await apiCollection<UserList>("/lists");
      setLists(response.data.map((list) => ({ ...list, items: [] })));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل قوائمك.");
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
  const publicCount = lists.filter((list) => list.visibility === "public").length;
  const privateCount = lists.length - publicCount;

  return (
    <main className="content library-page">
      <section className="library-hero" aria-labelledby="my-lists-title">
        <div className="library-header__copy">
          <p className="eyebrow">مكتبة ذوقك</p>
          <h1 id="my-lists-title">قوائمي</h1>
          <p className="muted">
            رفوف شخصية للأماكن التي بقيت في بالك، مرتبة كاختيارات صغيرة لا كمهام.
          </p>
          {!loading && !needsAuth && !error && lists.length > 0 ? (
            <div className="library-summary-strip" aria-label="ملخص مكتبة الذوق">
              <span>{lists.length} قوائم</span>
              <span>{totalPlaces} أماكن محفوظة</span>
              <span>{privateCount} خاصة</span>
              <span>{publicCount} عامة</span>
            </div>
          ) : null}
        </div>
        <Link className="ds-button library-header__action" href="/lists/new" ref={createLinkRef}>
          أضف قائمة
        </Link>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض قوائمك. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {loading ? <ListLoadingState count={3} label="جاري تحميل قوائمك" /> : null}

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
            <Link className="ds-button" href="/lists/new">
              أضف أول قائمة
            </Link>
          }
          body="ابدأ برف واحد يحمل مزاجًا واضحًا: قهوة هادئة، عشاء قريب، أو أماكن لوقت لاحق."
          title="مكتبتك جاهزة لأول رف"
        />
      ) : null}

      {!loading && !needsAuth && !error && lists.length > 0 ? (
        <section className="library-section library-section--quiet" aria-labelledby="library-shelves-title">
          <div className="library-section__header">
            <p className="eyebrow">رفوف محفوظة</p>
            <h2 id="library-shelves-title">اختياراتك التي تنتظر لحظتها</h2>
          </div>
          <div aria-label="قوائمي" className="library-grid">
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

      {!loading && !needsAuth && !error ? (
        <section className="public-lists-entry" aria-labelledby="public-lists-entry-title">
          <div>
            <p className="eyebrow">سطح ثانوي</p>
            <h2 id="public-lists-entry-title">القوائم العامة</h2>
            <p className="muted">
              افتح رفوفًا عامة متاحة للمستخدمين المسجلين فقط، كمسار قراءة ثانوي داخل مكتبتك.
            </p>
          </div>
          <Link className="ds-button ds-button--secondary" href="/lists/public">
            افتح القوائم العامة
          </Link>
        </section>
      ) : null}
    </main>
  );
}
