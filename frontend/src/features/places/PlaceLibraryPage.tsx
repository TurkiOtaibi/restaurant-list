"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AddIcon,
  Button,
  EmptyState,
  PlaceCard,
  SearchField,
  StatusMessage
} from "@/components/ui";
import { ApiError, Place, apiCollection, clearTokens, getAccessToken } from "@/lib/api";
import { cx } from "@/lib/ui";

import { placeTypeOptions, PlaceType } from "./taxonomy";

export function PlaceLibraryPage() {
  const [activeType, setActiveType] = useState<PlaceType>("restaurant");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const createLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "restaurant" || type === "cafe" || type === "ice_cream") {
      setActiveType(type);
    }

    if (params.get("focus") === "create-place") {
      createLinkRef.current?.focus();
    }
  }, []);

  const loadPlaces = useCallback(async () => {
    if (!getAccessToken()) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ type: activeType });
      const normalizedSearch = submittedSearch.trim();
      if (normalizedSearch) {
        params.set("q", normalizedSearch);
      }

      const response = await apiCollection<Place>(`/places?${params.toString()}`);
      setPlaces(response.data);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل الأماكن.");
      }
    } finally {
      setLoading(false);
    }
  }, [activeType, submittedSearch]);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  function selectType(type: PlaceType) {
    setActiveType(type);
    const params = new URLSearchParams(window.location.search);
    params.set("type", type);
    params.delete("focus");
    window.history.replaceState(null, "", `/places?${params.toString()}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchTerm);
  }

  function handleClearSearch() {
    setSearchTerm("");
    setSubmittedSearch("");
  }

  const isSearching = submittedSearch.trim().length > 0;

  return (
    <main className="content place-library-page">
      <section className="place-library-hero" aria-labelledby="places-title">
        <div className="place-library-hero__copy">
          <h1 id="places-title">الأماكن</h1>
        </div>
        <Link
          aria-label="أضف مكانًا"
          className="ds-button ds-button--icon"
          href={`/places/new?type=${activeType}`}
          ref={createLinkRef}
        >
          <AddIcon />
        </Link>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجل الدخول لعرض الأماكن. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {!needsAuth ? (
        <>
          <div className="place-type-filters" aria-label="نوع المكان">
            {placeTypeOptions.map((option) => (
              <Button
                aria-pressed={activeType === option.value}
                className={cx(activeType === option.value && "is-selected")}
                key={option.value}
                onClick={() => selectType(option.value)}
                type="button"
                variant={activeType === option.value ? "primary" : "secondary"}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <form aria-label="بحث الأماكن" className="place-library-search" onSubmit={handleSearchSubmit}>
            <SearchField
              label="بحث"
              onChange={(event) => setSearchTerm(event.target.value)}
              onClear={searchTerm || submittedSearch ? handleClearSearch : undefined}
              placeholder="ابحث عن مكان"
              resultCount={!loading && isSearching ? places.length : undefined}
              value={searchTerm}
            />
            <Button isLoading={loading && isSearching} type="submit" variant="secondary">
              بحث
            </Button>
          </form>
        </>
      ) : null}

      {loading ? <PlaceLibraryLoading label="جاري تحميل الأماكن" /> : null}
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      {!loading && !needsAuth && places.length === 0 ? (
        <EmptyState
          action={
            isSearching ? (
              <Button onClick={handleClearSearch} type="button" variant="secondary">
                مسح البحث
              </Button>
            ) : (
              <Link className="ds-button" href={`/places/new?type=${activeType}`}>أضف مكانًا</Link>
            )
          }
          body={isSearching ? "غيّر الاسم أو امسح البحث." : "أضف مكانًا للبدء."}
          title={isSearching ? "لا توجد نتائج" : "لا توجد أماكن"}
        />
      ) : null}

      {!loading && !needsAuth && places.length > 0 ? (
        <section className="place-memory-section" aria-label="قائمة الأماكن">
          <div className="place-memory-list">
            {places.map((place) => (
              <PlaceCard href={`/places/${place.id}`} key={place.id} place={place} view="row" />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function PlaceLibraryLoading({ label }: { label: string }) {
  return (
    <section className="place-library-loading" aria-label={label} aria-live="polite">
      <span />
      <span />
      <span />
    </section>
  );
}
