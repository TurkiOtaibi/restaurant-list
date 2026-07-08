"use client";

import { Tabs } from "@base-ui/react/tabs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AddIcon,
  BottomSheet,
  Button,
  EmptyState,
  FilterIcon,
  PlaceCard,
  SearchField,
  StatusMessage,
  VirtualList
} from "@/components/ui";
import {
  ApiError,
  Place,
  apiCollection,
  ensureSession,
  isSessionRecoveryError
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";
import { cx } from "@/lib/ui";

import {
  buildPlaceLibraryApiQuery,
  buildPlaceLibraryUrl,
  parsePlaceLibraryUrlState
} from "./placeLibraryQuery";
import {
  placeSubtypeLabel,
  placeTypeOptions,
  PlaceType,
  SubtypeFilterValue,
  subtypeOptionsForType
} from "./taxonomy";

// Bounded page size so the catalog loads incrementally as the user scrolls,
// never downloading the whole catalog at once (PLACE-001-US-006/US-015).
const PAGE_SIZE = 20;

export function PlaceLibraryPage({ initialType }: { initialType: PlaceType }) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const [activeType, setActiveType] = useState<PlaceType>(initialType);
  const [places, setPlaces] = useState<Place[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeSubtype, setActiveSubtype] = useState<SubtypeFilterValue>("all");
  const [subtypeFilterOpen, setSubtypeFilterOpen] = useState(false);
  const createLinkRef = useRef<HTMLAnchorElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // The active load generation. Switching type/filter/search increments it so a
  // late page response from a previous filter is ignored (no out-of-order rows).
  const requestIdRef = useRef(0);
  // Number of rows fetched from the server (the next offset). Tracked separately
  // from places.length because client-side de-duplication may drop overlapping
  // rows while the server offset must keep advancing.
  const loadedCountRef = useRef(0);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const urlState = parsePlaceLibraryUrlState(
      currentSearch ? `?${currentSearch}` : "",
      initialType
    );

    setActiveType(urlState.type);
    setActiveSubtype(urlState.subtype);
    setSearchTerm(urlState.q);
    setSubmittedSearch(urlState.q);

    if (urlState.focusCreatePlace) {
      createLinkRef.current?.focus();
    }
    if (urlState.focusSearch) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [currentSearch, initialType]);

  const buildQuery = useCallback(
    (offset: number) =>
      buildPlaceLibraryApiQuery({
        limit: PAGE_SIZE,
        offset,
        q: submittedSearch,
        subtype: activeSubtype,
        type: activeType
      }),
    [activeSubtype, activeType, submittedSearch]
  );

  const loadFirstPage = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isCurrent = () => requestId === requestIdRef.current;

    try {
      const restoredToken = await ensureSession().catch(() => null);
      if (isCurrent()) {
        setIsAuthenticated(Boolean(restoredToken));
      }
      setLoading(true);
      setError("");
      setPageError(false);
      setReachedEnd(false);
      loadingMoreRef.current = false;
      setLoadingMore(false);

      const response = await apiCollection<Place>(`/places?${buildQuery(0)}`, {
        auth: "optional"
      });
      if (!isCurrent()) {
        return;
      }
      setPlaces(response.data);
      setTotal(response.meta.total);
      loadedCountRef.current = response.data.length;
      setReachedEnd(response.data.length === 0 || response.data.length >= response.meta.total);
    } catch (caught) {
      if (!isCurrent()) {
        return;
      }
      if (caught instanceof ApiError && caught.status === 401) {
        setError(caught.message);
      } else if (isSessionRecoveryError(caught)) {
        setError("تعذر استعادة الجلسة. حاول مرة أخرى.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل الأماكن.");
      }
    } finally {
      if (isCurrent()) {
        setLoading(false);
      }
    }
  }, [buildQuery]);

  const loadNextPage = useCallback(async () => {
    if (loadingMoreRef.current || reachedEnd) {
      return;
    }
    const requestId = requestIdRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setPageError(false);

    try {
      const response = await apiCollection<Place>(
        `/places?${buildQuery(loadedCountRef.current)}`,
        { auth: "optional" }
      );
      if (requestId !== requestIdRef.current) {
        return;
      }
      loadedCountRef.current += response.data.length;
      setPlaces((previous) => {
        const seen = new Set(previous.map((place) => place.id));
        const merged = [...previous];
        for (const place of response.data) {
          if (!seen.has(place.id)) {
            seen.add(place.id);
            merged.push(place);
          }
        }
        return merged;
      });
      setTotal(response.meta.total);
      if (response.data.length === 0 || loadedCountRef.current >= response.meta.total) {
        setReachedEnd(true);
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setPageError(true);
      }
    } finally {
      loadingMoreRef.current = false;
      if (requestId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [buildQuery, reachedEnd]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  // Continuous scrolling: when the end sentinel approaches the viewport, fetch
  // the next page. Serialized via loadingMoreRef so rapid scrolling cannot create
  // duplicate in-flight requests (PLACE-001-US-015).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    if (loading || reachedEnd || pageError) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, loading, pageError, reachedEnd, places.length]);

  function selectType(type: PlaceType) {
    if (type === activeType) {
      return;
    }

    setActiveType(type);
    setActiveSubtype("all");
    updateUrl({ type, subtype: "all", q: submittedSearch });
  }

  function handleTypeTabChange(value: PlaceType) {
    selectType(value);
  }

  function selectSubtype(subtype: SubtypeFilterValue) {
    setActiveSubtype(subtype);
    setSubtypeFilterOpen(false);
    updateUrl({ type: activeType, subtype, q: submittedSearch });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSearch = searchTerm.trim();
    setSubmittedSearch(normalizedSearch);
    updateUrl({ type: activeType, subtype: activeSubtype, q: normalizedSearch });
  }

  function handleClearSearch() {
    setSearchTerm("");
    setSubmittedSearch("");
    updateUrl({ type: activeType, subtype: activeSubtype, q: "" });
  }

  function handleClearFilters() {
    setSearchTerm("");
    setSubmittedSearch("");
    setActiveSubtype("all");
    updateUrl({ type: activeType, subtype: "all", q: "" });
  }

  function updateUrl({
    q,
    subtype,
    type
  }: {
    q: string;
    subtype: SubtypeFilterValue;
    type: PlaceType;
  }) {
    window.history.replaceState(null, "", buildPlaceLibraryUrl({ q, subtype, type }));
  }

  const isSearching = submittedSearch.trim().length > 0;
  const subtypeOptions = subtypeOptionsForType(activeType);
  const showSubtypeFilter = subtypeOptions.length > 0;
  const selectedSubtypeLabel =
    activeSubtype === "all" ? "الكل" : placeSubtypeLabel(activeSubtype) ?? "الكل";
  const hasActiveFilter = isSearching || activeSubtype !== "all";
  const hasResults = places.length > 0;
  const liveMessage = loadingMore
    ? "جارٍ تحميل المزيد من الأماكن"
    : reachedEnd && hasResults
      ? "تم عرض كل الأماكن"
      : "";
  const createPlaceHref = isAuthenticated
    ? `/places/new?type=${activeType}`
    : loginHrefForReturn(`/places/new?type=${activeType}`);

  return (
    <main className="content place-library-page">
      <section className="place-library-hero" aria-labelledby="places-title">
        <div className="place-library-hero__copy">
          <h1 id="places-title">الأماكن</h1>
        </div>
        <Link
          aria-label="أضف مكانًا"
          className="ds-button ds-button--icon"
          href={createPlaceHref}
          ref={createLinkRef}
        >
          <AddIcon />
        </Link>
      </section>

      <>
          <Tabs.Root
            className="place-type-tabs"
            dir="rtl"
            onValueChange={handleTypeTabChange}
            value={activeType}
          >
            <Tabs.List activateOnFocus aria-label="نوع المكان" className="place-type-filters">
              {placeTypeOptions.map((option) => (
                <Tabs.Tab
                  key={option.value}
                  render={
                    <button
                      className={cx(
                        "ds-button",
                        "ds-button--secondary",
                        "place-type-filters__tab",
                        activeType === option.value && "is-selected"
                      )}
                      type="button"
                    >
                      {option.label}
                    </button>
                  }
                  value={option.value}
                />
              ))}
            </Tabs.List>
          </Tabs.Root>

          <form aria-label="بحث الأماكن" className="place-library-search" onSubmit={handleSearchSubmit}>
            <SearchField
              inputRef={searchInputRef}
              label="بحث"
              onChange={(event) => setSearchTerm(event.target.value)}
              onClear={searchTerm || submittedSearch ? handleClearSearch : undefined}
              placeholder="ابحث عن مكان"
              resultCount={!loading && isSearching ? total ?? places.length : undefined}
              value={searchTerm}
            />
            <Button isLoading={loading && isSearching} type="submit" variant="secondary">
              بحث
            </Button>
          </form>

          {showSubtypeFilter ? (
            <div className="place-subtype-filter">
              <Button
                aria-haspopup="dialog"
                aria-label={`التصنيف: ${selectedSubtypeLabel}`}
                className="place-subtype-filter__trigger"
                onClick={() => setSubtypeFilterOpen(true)}
                type="button"
                variant="secondary"
              >
                <FilterIcon />
                <span>التصنيف: {selectedSubtypeLabel}</span>
              </Button>
            </div>
          ) : null}

          <BottomSheet
            closeLabel="إغلاق"
            labelledBy="place-subtype-filter-title"
            onClose={() => setSubtypeFilterOpen(false)}
            open={subtypeFilterOpen}
            title="التصنيف"
          >
            <div
              aria-label="تصفية حسب النوع"
              className="place-subtype-filter__options"
              role="radiogroup"
            >
              {subtypeOptions.map((option) => (
                <Button
                  aria-checked={activeSubtype === option.value}
                  className={cx(
                    "place-subtype-filter__option",
                    activeSubtype === option.value && "is-selected"
                  )}
                  key={option.value}
                  onClick={() => selectSubtype(option.value)}
                  role="radio"
                  type="button"
                  variant="secondary"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </BottomSheet>
      </>

      {loading ? <PlaceLibraryLoading label="جاري تحميل الأماكن" /> : null}
      {error ? (
        <section className="retry-panel" aria-labelledby="places-error-title">
          <StatusMessage tone="error">
            <span id="places-error-title">{error}</span>
          </StatusMessage>
          <Button onClick={() => void loadFirstPage()} type="button" variant="secondary">
            حاول مرة أخرى
          </Button>
        </section>
      ) : null}

      {!loading && !error && !hasResults ? (
        <EmptyState
          action={
            hasActiveFilter ? (
              <Button onClick={handleClearFilters} type="button" variant="secondary">
                عرض الكل
              </Button>
            ) : (
              <Link className="ds-button" href={createPlaceHref}>أضف مكانًا</Link>
            )
          }
          body={hasActiveFilter ? "غيّر البحث أو الفلتر." : "أضف مكانًا للبدء."}
          title={hasActiveFilter ? "لا توجد نتائج" : "لا توجد أماكن"}
        />
      ) : null}

      {!loading && hasResults ? (
        <section className="place-memory-section" aria-label="قائمة الأماكن">
          <VirtualList
            ariaLabel="قائمة الأماكن"
            className="place-memory-list"
            getKey={(place) => place.id}
            items={places}
            renderItem={(place) => (
              <PlaceCard href={`/places/${place.id}`} place={place} view="row" />
            )}
          />

          {pageError ? (
            <div className="place-library-more-error">
              <StatusMessage tone="error">تعذر تحميل المزيد من الأماكن.</StatusMessage>
              <Button onClick={() => void loadNextPage()} type="button" variant="secondary">
                إعادة المحاولة
              </Button>
            </div>
          ) : null}

          {loadingMore ? (
            <PlaceLibraryLoading label="جارٍ تحميل المزيد من الأماكن" />
          ) : null}

          {!reachedEnd && !pageError ? <div ref={sentinelRef} aria-hidden="true" /> : null}
        </section>
      ) : null}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>
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
