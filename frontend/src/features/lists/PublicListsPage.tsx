"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  ButtonLink,
  EmptyState,
  ListCard,
  LoadingState,
  StatusMessage
} from "@/components/ui";
import {
  ApiError,
  ListDetail,
  UserList,
  apiCollection,
  clearTokens,
  getAccessToken
} from "@/lib/api";

export function PublicListsPage() {
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
      const response = await apiCollection<UserList>("/lists/public");
      setLists(response.data.map((list) => ({ ...list, items: [] })));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القوائم العامة.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  return (
    <main className="content public-lists-page">
      <section className="public-lists-hero" aria-labelledby="public-lists-title">
        <div className="public-lists-hero__copy">
          <p className="eyebrow">سطح ثانوي</p>
          <h1 id="public-lists-title">القوائم العامة</h1>
          <p className="muted">
            رفوف عامة يفتحها المستخدمون المسجلون فقط. سطح قراءة هادئ لا يزاحم مكتبتك الشخصية.
          </p>
        </div>
        <ButtonLink href="/lists" variant="secondary">
          رجوع لقوائمي
        </ButtonLink>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض القوائم العامة. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {loading ? <LoadingState count={3} delayMs={0} label="جاري تحميل القوائم العامة" /> : null}

      {error ? (
        <section className="retry-panel" aria-labelledby="public-lists-error-title">
          <StatusMessage tone="error">
            <span id="public-lists-error-title">{error}</span>
          </StatusMessage>
          <Button onClick={() => void loadLists()} type="button" variant="secondary">
            حاول مرة أخرى
          </Button>
        </section>
      ) : null}

      {!loading && !needsAuth && !error && lists.length === 0 ? (
        <EmptyState
          action={<ButtonLink href="/lists">رجوع لقوائمي</ButtonLink>}
          body="القوائم العامة تظهر هنا عندما تكون متاحة للمستخدمين المسجلين."
          title="لا توجد قوائم عامة"
        />
      ) : null}

      {!loading && !needsAuth && !error && lists.length > 0 ? (
        <section className="public-lists-section" aria-labelledby="public-lists-section-title">
          <div className="library-section__header">
            <p className="eyebrow">للقراءة فقط</p>
            <h2 id="public-lists-section-title">رفوف يمكن فتحها دون إدارة</h2>
          </div>
          <div className="library-grid" aria-label="القوائم العامة المتاحة">
            {lists.map((list) => (
              <ListCard
                context="viewer"
                href={`/lists/public/${list.id}`}
                isEmpty={list.placeCount === 0}
                key={list.id}
                list={list}
                placeCount={list.placeCount}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
