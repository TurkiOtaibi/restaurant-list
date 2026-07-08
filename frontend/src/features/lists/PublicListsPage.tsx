"use client";

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
  apiCollection
} from "@/lib/api";

export function PublicListsPage() {
  const [lists, setLists] = useState<ListDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLists = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const response = await apiCollection<UserList>("/lists/public", { auth: "optional" });
      setLists(response.data.map((list) => ({ ...list, items: [] })));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القوائم العامة.");
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
          <h1 id="public-lists-title">القوائم العامة</h1>
        </div>
        <ButtonLink href="/lists" variant="secondary">
          رجوع لقوائمي
        </ButtonLink>
      </section>


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

      {!loading && !error && lists.length === 0 ? (
        <EmptyState
          action={<ButtonLink href="/lists">رجوع لقوائمي</ButtonLink>}
          title="لا توجد قوائم عامة"
        />
      ) : null}

      {!loading && !error && lists.length > 0 ? (
        <section className="public-lists-section" aria-labelledby="public-lists-section-title">
          <div className="library-section__header">
            <h2 id="public-lists-section-title">قوائم عامة</h2>
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
