"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Badge,
  BidiText,
  Button,
  ButtonLink,
  EmptyState,
  LoadingState,
  PlaceCard,
  StatusMessage
} from "@/components/ui";
import { ApiError, ListDetail, apiRequest, clearTokens, getAccessToken } from "@/lib/api";

type PublicListDetailPageProps = {
  listId: string;
};

export function PublicListDetailPage({ listId }: PublicListDetailPageProps) {
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadList = useCallback(async () => {
    setError("");
    setNeedsAuth(false);
    setLoading(true);

    if (!getAccessToken()) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest<ListDetail>(`/lists/public/${listId}`);
      setList(response);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else if (caught instanceof ApiError && caught.status === 404) {
        setError("هذه القائمة خاصة أو غير متاحة.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القائمة العامة.");
      }
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const placeCount = list?.items.length ?? 0;

  return (
    <main className="content public-list-detail-page">
      <section
        aria-labelledby="public-list-detail-title"
        aria-roledescription="قائمة عامة للقراءة فقط"
        className="public-list-detail-hero"
      >
        <div className="public-list-detail-hero__copy">
          <p className="eyebrow">قائمة عامة</p>
          <h1 id="public-list-detail-title">
            {list ? <BidiText>{list.name}</BidiText> : "قائمة عامة"}
          </h1>
          {list ? (
            <div className="collection-hero__meta">
              <Badge variant="public">عام</Badge>
              <span>{placeCountLabel(placeCount)}</span>
              <span>عرض فقط</span>
            </div>
          ) : null}
          <p className="muted">
            قائمة عامة قابلة للقراءة للمستخدمين المسجلين. لا تظهر هنا ملاحظات خاصة أو أدوات إدارة.
          </p>
        </div>
        <ButtonLink href="/lists/public" variant="secondary">
          رجوع للقوائم العامة
        </ButtonLink>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض هذه القائمة العامة. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {loading ? <LoadingState count={3} delayMs={0} label="جاري تحميل القائمة العامة" /> : null}

      {error ? (
        <section className="retry-panel" aria-labelledby="public-list-error-title">
          <StatusMessage tone="error">
            <span id="public-list-error-title">{error}</span>
          </StatusMessage>
          <Button onClick={() => void loadList()} type="button" variant="secondary">
            حاول مرة أخرى
          </Button>
        </section>
      ) : null}

      {!loading && list && list.items.length === 0 ? (
        <EmptyState
          action={<ButtonLink href="/lists/public">رجوع للقوائم العامة</ButtonLink>}
          body="لا توجد أماكن في هذه القائمة العامة."
          title="هذه القائمة فارغة"
        />
      ) : null}

      {!loading && list && list.items.length > 0 ? (
        <section className="public-list-places" aria-labelledby="public-list-places-title">
          <div className="library-section__header">
            <p className="eyebrow">أماكن عامة</p>
            <h2 id="public-list-places-title">أماكن محفوظة في هذا الرف</h2>
          </div>
          <div className="collection-artifacts" aria-label="أماكن القائمة العامة">
            {list.items.map((item) => (
              <PlaceCard
                actions={
                  <ButtonLink href={`/places/${item.place.id}`} variant="secondary">
                    افتح المكان
                  </ButtonLink>
                }
                key={item.id}
                place={item.place}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
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
