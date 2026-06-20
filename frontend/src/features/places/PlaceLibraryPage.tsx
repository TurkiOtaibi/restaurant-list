"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Badge,
  BidiText,
  BottomSheet,
  Button,
  ButtonLink,
  EmptyState,
  Modal,
  SearchField,
  StatusMessage
} from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, Place, UserList, apiCollection, apiRequest, clearTokens, getAccessToken } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";
import { cx } from "@/lib/ui";

type PlaceType = "restaurant" | "cafe";

type PlaceLibraryPageProps = {
  placeType: PlaceType;
};

type PlaceRelationship = {
  listNames: string[];
};

type SaveListSummary = UserList & {
  items: Array<{ place: Pick<Place, "id"> }>;
};

export function PlaceLibraryPage({ placeType }: PlaceLibraryPageProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [savePlace, setSavePlace] = useState<Place | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const createLinkRef = useRef<HTMLAnchorElement>(null);
  const copy = libraryCopy(placeType);

  const loadLibrary = useCallback(async () => {
    if (!getAccessToken()) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const normalizedSearch = submittedSearch.trim();
      const placesPath = normalizedSearch
        ? `/places?q=${encodeURIComponent(normalizedSearch)}`
        : "/places";
      const placeResponse = await apiCollection<Place>(placesPath);

      setPlaces(placeResponse.data.filter((place) => place.type === placeType));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : copy.error);
      }
    } finally {
      setLoading(false);
    }
  }, [copy.error, placeType, submittedSearch]);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("focus") === "create-place") {
      createLinkRef.current?.focus();
    }
  }, []);

  const relationships = useMemo(() => buildRelationships(places), [places]);
  const savedCount = places.filter((place) => relationships.get(place.id)?.listNames.length).length;
  const triedCount = places.filter((place) => place.currentUserTried).length;
  const isSearching = submittedSearch.trim().length > 0;

  function handleSavedList(place: Place, updatedList: UserList) {
    setPlaces((current) =>
      current.map((currentPlace) => {
        if (currentPlace.id !== place.id || currentPlace.currentUserListIds.includes(updatedList.id)) {
          return currentPlace;
        }

        return {
          ...currentPlace,
          currentUserListIds: [...currentPlace.currentUserListIds, updatedList.id],
          currentUserListNames: [...currentPlace.currentUserListNames, updatedList.name],
          currentUserListCount: currentPlace.currentUserListCount + 1
        };
      })
    );
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchTerm);
  }

  function handleClearSearch() {
    setSearchTerm("");
    setSubmittedSearch("");
  }

  return (
    <main className="content place-library-page">
      <section className="place-library-hero" aria-labelledby={`${placeType}-library-title`}>
        <div className="place-library-hero__copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id={`${placeType}-library-title`}>{copy.title}</h1>
          <p className="muted">{copy.body}</p>
          <div className="place-library-hero__summary" aria-label={copy.summaryLabel}>
            <span>{placeSummaryLabel(places.length, placeType)}</span>
            <span>{savedSummaryLabel(savedCount, placeType)}</span>
            <span>{triedSummaryLabel(triedCount, placeType)}</span>
          </div>
        </div>
        <Link className="ds-button" href={`/places/new?type=${placeType}`} ref={createLinkRef}>
          {copy.add}
        </Link>
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          {copy.authRequired} <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}
      {!needsAuth ? (
        <form
          aria-label={copy.searchFormLabel}
          className="place-library-search"
          onSubmit={handleSearchSubmit}
        >
          <SearchField
            label={copy.searchLabel}
            onChange={(event) => setSearchTerm(event.target.value)}
            onClear={searchTerm || submittedSearch ? handleClearSearch : undefined}
            placeholder={copy.searchPlaceholder}
            resultCount={!loading && isSearching ? places.length : undefined}
            scopeLabel={copy.searchScope}
            value={searchTerm}
          />
          <Button isLoading={loading && isSearching} type="submit" variant="secondary">
            {copy.searchAction}
          </Button>
        </form>
      ) : null}
      {loading ? <PlaceLibraryLoading label={copy.loading} /> : null}
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {!loading && !needsAuth && places.length === 0 && !isSearching ? (
        <EmptyState
          action={<ButtonLink href={`/places/new?type=${placeType}`}>{copy.addFirst}</ButtonLink>}
          body={copy.emptyBody}
          title={copy.emptyTitle}
        />
      ) : null}
      {!loading && !needsAuth && places.length === 0 && isSearching ? (
        <EmptyState
          action={
            <Button onClick={handleClearSearch} type="button" variant="secondary">
              {copy.clearSearch}
            </Button>
          }
          body={copy.searchEmptyBody}
          title={copy.searchEmptyTitle}
        />
      ) : null}

      {!loading && !needsAuth && places.length > 0 ? (
        <section className="place-memory-section" aria-labelledby={`${placeType}-memory-title`}>
          <div className="library-section__header">
            <p className="eyebrow">{copy.sectionEyebrow}</p>
            <h2 id={`${placeType}-memory-title`}>{copy.sectionTitle}</h2>
            <p className="muted">{copy.sectionBody}</p>
          </div>
          <div className="place-memory-grid" aria-label={copy.gridLabel}>
            {places.map((place) => {
              const relationship = relationships.get(place.id) ?? { listNames: [] };
              return (
                <PlaceMemoryCard
                  detailHref={`/places/${place.id}`}
                  key={place.id}
                  onSave={() => setSavePlace(place)}
                  place={place}
                  relationship={relationship}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {savePlace ? (
        <SavePlaceToListDialog
          onClose={() => setSavePlace(null)}
          onSaved={(list) => handleSavedList(savePlace, list)}
          open
          place={savePlace}
        />
      ) : null}
    </main>
  );
}

function PlaceMemoryCard({
  detailHref,
  onSave,
  place,
  relationship
}: {
  detailHref: string;
  onSave: () => void;
  place: Place;
  relationship: PlaceRelationship;
}) {
  const personalSignals = personalContextSignals(place, relationship);
  const hasRelationship =
    relationship.listNames.length > 0 || Boolean(place.currentUserRating) || place.currentUserTried;
  const relationshipHeadline = relationshipHeadlineFor(place, relationship);

  return (
    <article
      aria-label={`${relationshipHeadline}، ${place.name}، ${personalSignals.join("، ")}، ${communityRatingLabel(place)}`}
      className={cx("place-memory-card", hasRelationship && "place-memory-card--known")}
    >
      <span className="place-memory-card__spine" aria-hidden="true" />
      <div className="place-memory-card__relationship" aria-label="علاقتك بهذا المكان">
        <span>{relationshipHeadline}</span>
      </div>
      <div className="place-memory-card__header">
        <p className="place-memory-card__kicker">المكان الذي ترتبط به</p>
        <h2 className="place-memory-card__title">
          <BidiText>{place.name}</BidiText>
        </h2>
      </div>
      <ul className="place-memory-card__signals" aria-label="علاقتك بالمكان">
        {personalSignals.map((signal) => (
          <li key={signal}>{signal}</li>
        ))}
      </ul>
      <div className="place-memory-card__community" aria-label="تقييم المجتمع">
        <Badge variant="rating">{formatAverageRating(place.averageRating)}</Badge>
        <span>{ratingCountLabel(place.ratingCount)}</span>
      </div>
      <div className="actions place-memory-card__actions">
        <Button onClick={onSave} type="button">
          حفظ في رف
        </Button>
        <a className="ds-button ds-button--secondary" href={detailHref}>
          راجع العلاقة
        </a>
      </div>
    </article>
  );
}

function SavePlaceToListDialog({
  onClose,
  onSaved,
  open,
  place
}: {
  onClose: () => void;
  onSaved: (list: UserList) => void;
  open: boolean;
  place: Place;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const [lists, setLists] = useState<SaveListSummary[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [savingListId, setSavingListId] = useState<string | null>(null);
  const [savedListIds, setSavedListIds] = useState(place.currentUserListIds);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;
    setLoadingLists(true);
    setError("");

    apiCollection<UserList>("/lists")
      .then((response) => {
        if (isMounted) {
          setLists(response.data.map(toSaveListSummary));
        }
      })
      .catch((caught) => {
        if (isMounted) {
          setError(caught instanceof ApiError ? caught.message : "تعذر تحميل رفوفك.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingLists(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  async function saveToList(list: SaveListSummary) {
    setMessage("");
    setError("");
    setSavingListId(list.id);
    try {
      await apiRequest(`/lists/${list.id}/items`, {
        method: "POST",
        body: JSON.stringify({ placeId: place.id })
      });
      onSaved({
        ...list,
        placeCount: list.placeCount + (savedListIds.includes(list.id) ? 0 : 1)
      });
      setSavedListIds((current) => (current.includes(list.id) ? current : [...current, list.id]));
      setLists((current) =>
        current.map((currentList) =>
          currentList.id === list.id
            ? toSaveListSummary({
                ...currentList,
                placeCount: currentList.placeCount + (savedListIds.includes(list.id) ? 0 : 1)
              })
            : currentList
        )
      );
      setMessage(`حفظناه في ${list.name}.`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setMessage("هذا المكان محفوظ في هذا الرف بالفعل.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر حفظ المكان في الرف.");
      }
    } finally {
      setSavingListId(null);
    }
  }

  return (
    <Dialog
      initialFocusSelector="#save-place-list-options"
      labelledBy="save-place-title"
      onClose={onClose}
      open={open}
      title="احفظ في رف"
    >
      <div className="place-save-dialog">
        <p className="muted">
          اختر رفًا واحدًا لـ <BidiText>{place.name}</BidiText>.
        </p>
        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {loadingLists ? <PlaceLibraryLoading label="جاري تحميل رفوفك" /> : null}
        {!loadingLists && lists.length === 0 ? (
          <EmptyState
            action={<Link href="/lists/new">أنشئ رفًا</Link>}
            body="تحتاج رفًا واحدًا على الأقل قبل حفظ الأماكن."
            title="لا توجد رفوف بعد"
          />
        ) : null}
        {!loadingLists && lists.length > 0 ? (
          <div className="place-save-dialog__lists" id="save-place-list-options" tabIndex={-1}>
            {lists.map((list) => {
              const isSavedHere = savedListIds.includes(list.id);
              return (
                <article className="place-save-dialog__list" key={list.id}>
                  <div>
                    <h3>
                      <BidiText>{list.name}</BidiText>
                    </h3>
                    <p className="muted">
                      {list.items.length === 0 ? "رف فارغ" : listPlaceCountLabel(list.items.length)}
                    </p>
                  </div>
                  <Button
                    disabled={isSavedHere}
                    isLoading={savingListId === list.id}
                    onClick={() => void saveToList(list)}
                    type="button"
                    variant={isSavedHere ? "secondary" : "primary"}
                  >
                    {isSavedHere ? "محفوظ هنا" : "احفظ هنا"}
                  </Button>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </Dialog>
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

function toSaveListSummary(list: UserList): SaveListSummary {
  return {
    ...list,
    items: Array.from({ length: list.placeCount }, () => ({ place: { id: "" } }))
  };
}

function buildRelationships(places: Place[]): Map<string, PlaceRelationship> {
  const relationships = new Map<string, PlaceRelationship>();

  places.forEach((place) => {
    relationships.set(place.id, {
      listNames: place.currentUserListNames
    });
  });

  return relationships;
}

function personalContextSignals(place: Place, relationship: PlaceRelationship): string[] {
  const signals: string[] = [];

  if (relationship.listNames.length > 0) {
    signals.push(listRelationshipLabel(relationship.listNames.length));
  }

  if (place.currentUserTried) {
    signals.push("جربته");
  }

  if (place.currentUserRating) {
    signals.push(`تقييمك ${place.currentUserRating}/10`);
  }

  return signals.length > 0 ? signals : ["لم تضف علاقتك به بعد"];
}

function relationshipHeadlineFor(place: Place, relationship: PlaceRelationship): string {
  const isSaved = relationship.listNames.length > 0;
  const isRated = Boolean(place.currentUserRating);

  if (isSaved && place.currentUserTried && isRated) {
    return "محفوظ وجربته وقيّمته";
  }

  if (isSaved && place.currentUserTried) {
    return "محفوظ ومجرّب في ذوقك";
  }

  if (isSaved && isRated) {
    return "محفوظ وله تقييمك";
  }

  if (isSaved) {
    return listRelationshipLabel(relationship.listNames.length);
  }

  if (place.currentUserTried && isRated) {
    return "جربته وقيّمته";
  }

  if (place.currentUserTried) {
    return "مكان جربته";
  }

  if (isRated) {
    return `قيّمته ${place.currentUserRating}/10`;
  }

  return "ينتظر سببًا للحفظ";
}

function communityRatingLabel(place: Place): string {
  return place.averageRating === null
    ? "لا توجد تقييمات من المجتمع"
    : `تقييم المجتمع ${formatAverageRating(place.averageRating)} من ${ratingCountLabel(place.ratingCount)}`;
}

function ratingCountLabel(count: number): string {
  if (count === 0) {
    return "لا تقييمات بعد";
  }

  if (count === 1) {
    return "تقييم واحد";
  }

  if (count === 2) {
    return "تقييمان";
  }

  return `${count} تقييمات`;
}

function listRelationshipLabel(count: number): string {
  if (count === 1) {
    return "محفوظ في رف واحد";
  }

  if (count === 2) {
    return "محفوظ في رفين";
  }

  return `محفوظ في ${count} رفوف`;
}

function listPlaceCountLabel(count: number): string {
  if (count === 1) {
    return "مكان واحد";
  }

  if (count === 2) {
    return "مكانان";
  }

  return `${count} أماكن`;
}

function placeSummaryLabel(count: number, placeType: PlaceType): string {
  if (placeType === "restaurant") {
    if (count === 0) {
      return "لا توجد مطاعم";
    }

    if (count === 1) {
      return "مطعم واحد";
    }

    if (count === 2) {
      return "مطعمان";
    }

    return `${count} مطاعم`;
  }

  if (count === 0) {
    return "لا توجد مقاهٍ";
  }

  if (count === 1) {
    return "مقهى واحد";
  }

  if (count === 2) {
    return "مقهيان";
  }

  return `${count} مقاهٍ`;
}

function savedSummaryLabel(count: number, placeType: PlaceType): string {
  if (count === 0) {
    return placeType === "restaurant" ? "لا مطاعم محفوظة" : "لا مقاهٍ محفوظة";
  }

  if (count === 1) {
    return placeType === "restaurant" ? "مطعم محفوظ في رفوفك" : "مقهى محفوظ في رفوفك";
  }

  if (count === 2) {
    return placeType === "restaurant" ? "مطعمان محفوظان في رفوفك" : "مقهيان محفوظان في رفوفك";
  }

  return placeType === "restaurant" ? `${count} مطاعم محفوظة` : `${count} مقاهٍ محفوظة`;
}

function triedSummaryLabel(count: number, placeType: PlaceType): string {
  if (count === 0) {
    return placeType === "restaurant" ? "لا مطاعم مجربة" : "لا مقاهٍ مجربة";
  }

  if (count === 1) {
    return placeType === "restaurant" ? "مطعم جربته" : "مقهى جربته";
  }

  if (count === 2) {
    return placeType === "restaurant" ? "مطعمان جربتهما" : "مقهيان جربتهما";
  }

  return placeType === "restaurant" ? `${count} مطاعم جربتها` : `${count} مقاهٍ جربتها`;
}

function libraryCopy(placeType: PlaceType) {
  if (placeType === "restaurant") {
    return {
      add: "أضف مطعمًا",
      addFirst: "أضف أول مطعم",
      authRequired: "سجّل الدخول لعرض مطاعمك.",
      body: "مطاعم تظهر من خلال علاقتك بها: ما حفظته، ما جربته، وما يستحق أن يعود إلى رفوفك.",
      emptyBody: "ابدأ بمطعم واحد تريد تذكره، لا بسجل طويل من الأماكن.",
      emptyTitle: "لا توجد مطاعم في مكتبة ذوقك بعد",
      error: "تعذر تحميل المطاعم.",
      eyebrow: "مطاعم في ذوقك",
      gridLabel: "مطاعم مكتبة الذوق",
      loading: "جاري تحميل مطاعمك",
      clearSearch: "مسح البحث",
      searchAction: "ابحث",
      searchEmptyBody: "غيّر الاسم أو امسح البحث. البحث هنا لا يعرض توصيات أو تصنيفات خارج الاسم.",
      searchEmptyTitle: "لا يوجد مطعم بهذا الاسم",
      searchFormLabel: "البحث في مطاعم مكتبة الذوق",
      searchLabel: "ابحث باسم مطعم",
      searchPlaceholder: "مثال: بيت الورد",
      searchScope: "نبحث في اسم المكان فقط، ثم نعرض علاقتك به قبل أي شيء آخر.",
      sectionBody: "العلاقة الشخصية أولًا، ثم تقييم المجتمع كإشارة مساعدة.",
      sectionEyebrow: "أماكن لها سياق",
      sectionTitle: "مطاعم ليست مجرد أسماء",
      summaryLabel: "ملخص مطاعمك",
      title: "المطاعم"
    };
  }

  return {
    add: "أضف مقهى",
    addFirst: "أضف أول مقهى",
    authRequired: "سجّل الدخول لعرض مقاهيك.",
    body: "مقاهٍ تحفظها كأوقات صغيرة: جلسة هادئة، قهوة تستحق العودة، أو مكان بقي في بالك.",
    emptyBody: "أضف مقهى واحدًا يستحق أن يكون جزءًا من ذاكرتك.",
    emptyTitle: "لا توجد مقاهٍ في مكتبة ذوقك بعد",
    error: "تعذر تحميل المقاهي.",
    eyebrow: "مقاهٍ في ذوقك",
    gridLabel: "مقاهي مكتبة الذوق",
    loading: "جاري تحميل مقاهيك",
    clearSearch: "مسح البحث",
    searchAction: "ابحث",
    searchEmptyBody: "غيّر الاسم أو امسح البحث. البحث هنا لا يعرض توصيات أو تصنيفات خارج الاسم.",
    searchEmptyTitle: "لا يوجد مقهى بهذا الاسم",
    searchFormLabel: "البحث في مقاهي مكتبة الذوق",
    searchLabel: "ابحث باسم مقهى",
    searchPlaceholder: "مثال: Nara Cafe",
    searchScope: "نبحث في اسم المكان فقط، ثم نعرض علاقتك به قبل أي شيء آخر.",
    sectionBody: "كل مقهى هنا يظهر كعلاقة صغيرة، لا كنتيجة بحث.",
    sectionEyebrow: "لحظات محفوظة",
    sectionTitle: "مقاهٍ تحتفظ بلحظتها",
    summaryLabel: "ملخص مقاهيك",
    title: "المقاهي"
  };
}
