"use client";

import Link from "next/link";
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
  StatusMessage
} from "@/components/ui";
import { ApiError, Place, apiCollection, clearTokens, ensureSession } from "@/lib/api";
import { cx } from "@/lib/ui";

import {
  isSubtypeValidForType,
  placeSubtypeLabel,
  placeTypeOptions,
  PlaceType,
  SubtypeFilterValue,
  subtypeOptionsForType
} from "./taxonomy";

export function PlaceLibraryPage({ initialType }: { initialType: PlaceType }) {
  const [activeType, setActiveType] = useState<PlaceType>(initialType);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeSubtype, setActiveSubtype] = useState<SubtypeFilterValue>("all");
  const [subtypeFilterOpen, setSubtypeFilterOpen] = useState(false);
  const createLinkRef = useRef<HTMLAnchorElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const nextType =
      type === "restaurant" || type === "cafe" || type === "ice_cream" ? type : initialType;
    const subtype = params.get("subtype") as SubtypeFilterValue | null;
    const query = params.get("q") ?? "";

    setActiveType(nextType);
    if (subtype && isSubtypeValidForType(nextType, subtype)) {
      setActiveSubtype(subtype);
    } else {
      setActiveSubtype("all");
    }
    setSearchTerm(query);
    setSubmittedSearch(query);

    if (params.get("focus") === "create-place") {
      createLinkRef.current?.focus();
    }
  }, [initialType]);

  const loadPlaces = useCallback(async () => {
    // Guard against out-of-order responses (e.g. a fast type switch): only the
    // most recently started load is allowed to apply its result.
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isCurrent = () => requestId === requestIdRef.current;

    if (!(await ensureSession())) {
      if (isCurrent()) {
        setNeedsAuth(true);
        setLoading(false);
      }
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
      if (activeSubtype !== "all" && activeType !== "ice_cream") {
        params.set("subtype", activeSubtype);
      }
      params.set("sort", "rating_desc");

      const response = await apiCollection<Place>(`/places?${params.toString()}`);
      if (isCurrent()) {
        setPlaces(response.data);
      }
    } catch (caught) {
      if (!isCurrent()) {
        return;
      }
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل الأماكن.");
      }
    } finally {
      if (isCurrent()) {
        setLoading(false);
      }
    }
  }, [activeSubtype, activeType, submittedSearch]);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  function selectType(type: PlaceType) {
    setActiveType(type);
    setActiveSubtype("all");
    updateUrl({ type, subtype: "all", q: submittedSearch });
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
    const params = new URLSearchParams();
    params.set("type", type);
    if (subtype !== "all" && type !== "ice_cream") {
      params.set("subtype", subtype);
    }
    if (q.trim()) {
      params.set("q", q.trim());
    }
    window.history.replaceState(null, "", `/places?${params.toString()}`);
  }

  const isSearching = submittedSearch.trim().length > 0;
  const subtypeOptions = subtypeOptionsForType(activeType);
  const showSubtypeFilter = subtypeOptions.length > 0;
  const selectedSubtypeLabel =
    activeSubtype === "all" ? "الكل" : placeSubtypeLabel(activeSubtype) ?? "الكل";
  const hasActiveFilter = isSearching || activeSubtype !== "all";

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

          {showSubtypeFilter ? (
            <div className="place-subtype-filter">
              <Button
                aria-haspopup="dialog"
                aria-label={`النوع: ${selectedSubtypeLabel}`}
                className="place-subtype-filter__trigger"
                onClick={() => setSubtypeFilterOpen(true)}
                type="button"
                variant="secondary"
              >
                <FilterIcon />
                <span>النوع: {selectedSubtypeLabel}</span>
              </Button>
            </div>
          ) : null}

          <BottomSheet
            closeLabel="إغلاق"
            labelledBy="place-subtype-filter-title"
            onClose={() => setSubtypeFilterOpen(false)}
            open={subtypeFilterOpen}
            title="نوع المكان"
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
      ) : null}

      {loading ? <PlaceLibraryLoading label="جاري تحميل الأماكن" /> : null}
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      {!loading && !needsAuth && places.length === 0 ? (
        <EmptyState
          action={
            hasActiveFilter ? (
              <Button onClick={handleClearFilters} type="button" variant="secondary">
                عرض الكل
              </Button>
            ) : (
              <Link className="ds-button" href={`/places/new?type=${activeType}`}>أضف مكانًا</Link>
            )
          }
          body={hasActiveFilter ? "غيّر البحث أو الفلتر." : "أضف مكانًا للبدء."}
          title={hasActiveFilter ? "لا توجد نتائج" : "لا توجد أماكن"}
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
