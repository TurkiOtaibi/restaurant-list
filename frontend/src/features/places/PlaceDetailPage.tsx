"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  ActionMenu,
  AddIcon,
  ArrowLeftIcon,
  BidiText,
  Button,
  ButtonLink,
  Chip,
  EmptyState,
  LoadingState,
  MoreVerticalIcon,
  PlaceTypeIcon,
  RatingDisplay,
  StatusMessage
} from "@/components/ui";
import {
  ApiError,
  Place,
  apiRequest,
  clearTokens,
  ensureSession,
  isSessionRecoveryError
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";
import { ratingCountLabel } from "@/lib/numerals";

import { SavePlaceToListDialog } from "./SavePlaceToListDialog";
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
    setLoading(true);
    setError("");
    try {
      if (!(await ensureSession())) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const placeResponse = await apiRequest<Place>(`/places/${placeId}`);
      setPlace(placeResponse);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else if (isSessionRecoveryError(caught)) {
        setError("تعذر استعادة الجلسة. حاول مرة أخرى.");
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
          سجل الدخول لعرض التفاصيل. <Link href={loginHrefForReturn(`/places/${placeId}`)}>تسجيل الدخول</Link>
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
      <div className="place-detail-topbar" aria-label="إجراءات المكان">
        <ButtonLink aria-label="العودة للأماكن" className="place-detail-topbar__action" href="/places" variant="secondary">
          <ArrowLeftIcon />
        </ButtonLink>
        <ActionMenu
          items={[
            {
              label: "أضف إلى قائمة",
              onSelect: () => setAddToListOpen(true)
            },
            {
              label: place.currentUserRating ? "تعديل التقييم" : "قيّم المكان",
              onSelect: () => {
                window.location.href = `/places/${place.id}/rate`;
              }
            }
          ]}
          label="خيارات المكان"
          trigger={<MoreVerticalIcon />}
        />
      </div>
      <section aria-labelledby="place-detail-title" className="place-detail-hero">
        <PlaceTypeIcon className="place-detail-hero__art" type={place.type} />
        <div className="place-detail-hero__content">
          <h1 id="place-detail-title">
            <BidiText>{place.name}</BidiText>
          </h1>
          <div className="place-detail-hero__chips" aria-label="نوع المكان">
            <Chip>{placeTypeLabel(place.type)}</Chip>
            {subtype ? <Chip>{subtype}</Chip> : null}
          </div>
          <div className="actions place-detail-hero__actions">
            <Button className="ds-button--full" onClick={() => setAddToListOpen(true)} type="button">
              <AddIcon />
              أضف إلى قائمة
            </Button>
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

        <article className="place-detail-panel place-detail-panel--rating">
          <h2>تقييمك</h2>
          <div className="place-detail-community">
            {place.currentUserRating ? (
              <RatingDisplay
                className="place-detail-community__rating"
                label="تقييمك الحالي"
                variant="outOfTen"
                value={place.currentUserRating}
              />
            ) : (
              <p className="muted">لم تضف تقييما لهذا المكان بعد.</p>
            )}
            <ButtonLink href={`/places/${place.id}/rate`} variant="secondary">
              {place.currentUserRating ? "تعديل التقييم" : "قيّم المكان"}
            </ButtonLink>
          </div>
        </article>

        {place.averageRating !== null && place.ratingCount > 0 ? (
          <article className="place-detail-panel">
            <h2>تقييم المجتمع</h2>
            <div className="place-detail-community">
              <RatingDisplay
                ariaLabel={ratingCountLabel(place.ratingCount)}
                className="place-detail-community__rating"
                value={place.averageRating}
              />
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
