"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Badge,
  BidiText,
  BottomSheet,
  Button,
  ButtonLink,
  Chip,
  EmptyState,
  LoadingState,
  Modal,
  NumberText,
  StatusMessage,
  VisualArtwork
} from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, Place, UserList, apiCollection, apiRequest, clearTokens, ensureSession } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";
import { formatOutOfTen, placeCountLabel, ratingCountLabel } from "@/lib/numerals";

import { placeSubtypeLabel, placeTypeLabel } from "./taxonomy";

type PlaceDetailPageProps = {
  placeId: string;
};

export function PlaceDetailPage({ placeId }: PlaceDetailPageProps) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [addToListOpen, setAddToListOpen] = useState(false);

  const loadPlace = useCallback(async () => {
    if (!(await ensureSession())) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const placeResponse = await apiRequest<Place>(`/places/${placeId}`);
      setPlace(placeResponse);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل المكان.");
      }
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

  if (needsAuth) {
    return (
      <main className="content place-detail-page">
        <StatusMessage tone="notice">
          سجل الدخول لعرض التفاصيل. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="content place-detail-page">
        <LoadingState count={4} delayMs={0} label="جاري تحميل المكان" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="content place-detail-page">
        <StatusMessage tone="error">{error}</StatusMessage>
        <ButtonLink href="/places" variant="secondary">
          العودة للأماكن
        </ButtonLink>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="content place-detail-page">
        <EmptyState
          action={<ButtonLink href="/places">العودة للأماكن</ButtonLink>}
          body="لم نجد هذا المكان."
          title="المكان غير موجود"
        />
      </main>
    );
  }

  const subtype = placeSubtypeLabel(place.subtype);

  return (
    <main className="content place-detail-page">
      <section aria-labelledby="place-detail-title" className="place-detail-hero">
        <VisualArtwork
          className="place-detail-hero__art"
          id={place.id}
          label={place.name}
          type={place.type}
          variant="place"
        />
        <div className="place-detail-hero__content">
          <h1 id="place-detail-title">
            <BidiText>{place.name}</BidiText>
          </h1>
          <div className="place-detail-hero__chips" aria-label="نوع المكان">
            <Chip>{placeTypeLabel(place.type)}</Chip>
            {subtype ? <Chip>{subtype}</Chip> : null}
          </div>
          {place.averageRating !== null && place.ratingCount > 0 ? (
            <div className="place-detail-hero__rating">
              <NumberText>{formatAverageRating(place.averageRating)}</NumberText>
              <span>{ratingCountLabel(place.ratingCount)}</span>
            </div>
          ) : null}
          <div className="actions place-detail-hero__actions">
            <Button onClick={() => setAddToListOpen(true)} type="button">
              أضف إلى قائمة
            </Button>
            <ButtonLink href={`/places/${place.id}/rate`} variant="secondary">
              {place.currentUserRating ? "تعديل التقييم" : "قيّم المكان"}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="place-detail-grid" aria-label="تفاصيل المكان">
        {place.currentUserListNames.length > 0 ? (
          <article className="place-detail-panel">
            <h2>موجود في</h2>
            <div className="place-detail-shelves">
              {place.currentUserListNames.map((name) => (
                <Chip key={name}>
                  <BidiText>{name}</BidiText>
                </Chip>
              ))}
            </div>
          </article>
        ) : null}

        {place.currentUserRating ? (
          <article className="place-detail-panel">
            <h2>تقييمك</h2>
            <div className="place-detail-community">
              <Badge variant="rating">
                <NumberText>{formatOutOfTen(place.currentUserRating)}</NumberText>
              </Badge>
              <ButtonLink href={`/places/${place.id}/rate`} variant="secondary">
                تعديل التقييم
              </ButtonLink>
            </div>
          </article>
        ) : null}

        {place.averageRating !== null && place.ratingCount > 0 ? (
          <article className="place-detail-panel">
            <h2>تقييم المجتمع</h2>
            <div className="place-detail-community">
              <Badge variant="rating">
                <NumberText>{formatAverageRating(place.averageRating)}</NumberText>
              </Badge>
              <span>{ratingCountLabel(place.ratingCount)}</span>
            </div>
          </article>
        ) : null}

        <article className="place-detail-panel">
          <h2>معلومات المكان</h2>
          <dl className="place-detail-info">
            <div>
              <dt>نوع المكان</dt>
              <dd>{placeTypeLabel(place.type)}</dd>
            </div>
            {subtype ? (
              <div>
                <dt>النوع الفرعي</dt>
                <dd>{subtype}</dd>
              </div>
            ) : null}
          </dl>
        </article>
      </section>

      {addToListOpen ? (
        <SavePlaceToListDialog
          onClose={() => setAddToListOpen(false)}
          onSaved={(updatedPlace) => setPlace(updatedPlace)}
          open
          place={place}
        />
      ) : null}
    </main>
  );
}

function SavePlaceToListDialog({
  onClose,
  onSaved,
  open,
  place
}: {
  onClose: () => void;
  onSaved: (place: Place) => void;
  open: boolean;
  place: Place;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const [lists, setLists] = useState<UserList[]>([]);
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
          setLists(response.data);
        }
      })
      .catch((caught) => {
        if (isMounted) {
          setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القوائم.");
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

  async function saveToList(list: UserList) {
    setMessage("");
    setError("");
    setSavingListId(list.id);
    try {
      await apiRequest(`/lists/${list.id}/items`, {
        method: "POST",
        body: JSON.stringify({ placeId: place.id })
      });
      const updatedPlace = await apiRequest<Place>(`/places/${place.id}`);
      onSaved(updatedPlace);
      setSavedListIds(updatedPlace.currentUserListIds);
      setMessage("تمت الإضافة.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذرت الإضافة.");
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
      title="أضف إلى قائمة"
    >
      <div className="place-save-dialog">
        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {loadingLists ? <LoadingState count={2} delayMs={0} label="جاري تحميل القوائم" /> : null}
        {!loadingLists && lists.length === 0 ? (
          <EmptyState
            action={<Link href="/lists/new">أنشئ قائمة</Link>}
            body="لا توجد قوائم."
            title="لا توجد قوائم"
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
                    <p className="muted">{placeCountLabel(list.placeCount)}</p>
                  </div>
                  <Button
                    disabled={isSavedHere}
                    isLoading={savingListId === list.id}
                    onClick={() => void saveToList(list)}
                    type="button"
                    variant={isSavedHere ? "secondary" : "primary"}
                  >
                    {isSavedHere ? "موجود" : "أضف"}
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
