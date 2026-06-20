"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Badge,
  BidiText,
  ButtonLink,
  Chip,
  EmptyState,
  LoadingState,
  StatusMessage
} from "@/components/ui";
import { ApiError, Place, apiRequest, clearTokens, getAccessToken } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";
import { cx } from "@/lib/ui";

type PlaceDetailPageProps = {
  placeId: string;
};

type PlaceRelationship = {
  listNames: string[];
};

export function PlaceDetailPage({ placeId }: PlaceDetailPageProps) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadPlace = useCallback(async () => {
    if (!getAccessToken()) {
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
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل علاقة المكان.");
      }
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

  const relationship = useMemo(() => buildRelationship(place), [place]);

  if (needsAuth) {
    return (
      <main className="content place-detail-page">
        <StatusMessage tone="notice">
          سجّل الدخول لعرض علاقتك بهذا المكان. <Link href="/login">تسجيل الدخول</Link>
        </StatusMessage>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="content place-detail-page">
        <LoadingState count={4} delayMs={0} label="جاري تحميل علاقة المكان" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="content place-detail-page">
        <StatusMessage tone="error">{error}</StatusMessage>
        <ButtonLink href="/restaurants" variant="secondary">
          العودة للمطاعم
        </ButtonLink>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="content place-detail-page">
        <EmptyState
          action={<ButtonLink href="/restaurants">العودة للمطاعم</ButtonLink>}
          body="لم نجد هذا المكان في مكتبة الأماكن."
          title="المكان غير موجود"
        />
      </main>
    );
  }

  const signals = personalContextSignals(place, relationship);
  const headline = relationshipHeadlineFor(place, relationship);
  const hasRelationship =
    relationship.listNames.length > 0 || Boolean(place.currentUserRating) || place.currentUserTried;
  const backHref = place.type === "cafe" ? "/cafes" : "/restaurants";
  const backLabel = place.type === "cafe" ? "العودة للمقاهي" : "العودة للمطاعم";
  const typeLabel = place.type === "cafe" ? "مقهى" : "مطعم";

  return (
    <main className="content place-detail-page">
      <section
        aria-labelledby="place-detail-title"
        className={cx("place-detail-hero", hasRelationship && "place-detail-hero--known")}
      >
        <span aria-hidden="true" className="place-detail-hero__spine" />
        <div className="place-detail-hero__content">
          <p className="eyebrow">علاقتك بالمكان</p>
          <div className="place-detail-hero__relationship">
            <span>{headline}</span>
          </div>
          <h1 id="place-detail-title">
            <BidiText>{place.name}</BidiText>
          </h1>
          <p className="muted">
            {hasRelationship
              ? "هذه الصفحة تحفظ ما يعنيه المكان لك قبل أي وصف آخر."
              : "ابدأ العلاقة بتقييم التجربة أو حفظ المكان في رف من رفوف ذوقك."}
          </p>
          <div className="place-detail-hero__chips" aria-label="ملخص علاقتك بالمكان">
            <Chip>{typeLabel}</Chip>
            {place.currentUserTried ? <Badge>جربته</Badge> : <Chip>لم تجربه بعد</Chip>}
            {place.currentUserRating ? (
              <Badge variant="rating">تقييمك {place.currentUserRating}/10</Badge>
            ) : (
              <Chip>لا يوجد تقييم شخصي</Chip>
            )}
            {relationship.listNames.length > 0 ? (
              <Chip>{listRelationshipLabel(relationship.listNames.length)}</Chip>
            ) : (
              <Chip>ليس في رفوفك الآن</Chip>
            )}
          </div>
          <div className="actions place-detail-hero__actions">
            <ButtonLink href={`/places/${place.id}/rate`}>
              {place.currentUserRating ? "حدّث تقييمك" : "قيّم تجربتك"}
            </ButtonLink>
            <ButtonLink href={backHref} variant="secondary">
              {backLabel}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="place-detail-grid" aria-label="تفاصيل علاقة المكان">
        <article className="place-detail-panel place-detail-panel--primary">
          <p className="eyebrow">ما تعرفه ذوق عنك</p>
          <h2>إشاراتك الشخصية</h2>
          <ul className="place-detail-signals">
            {signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>

        <article className="place-detail-panel">
          <p className="eyebrow">رفوفك</p>
          <h2>أين يظهر المكان؟</h2>
          {relationship.listNames.length > 0 ? (
            <div className="place-detail-shelves">
              {relationship.listNames.map((name) => (
                <Chip key={name}>
                  <BidiText>{name}</BidiText>
                </Chip>
              ))}
            </div>
          ) : (
            <p className="muted">
              ليس محفوظًا في أي رف حاليًا. إذا قيّمته الآن فسيبقى مجربًا حتى لو أضفته لاحقًا.
            </p>
          )}
        </article>

        <article className="place-detail-panel">
          <p className="eyebrow">المجتمع</p>
          <h2>إشارة مساعدة فقط</h2>
          <div className="place-detail-community">
            <Badge variant="rating">{formatAverageRating(place.averageRating)}</Badge>
            <span>{ratingCountLabel(place.ratingCount)}</span>
          </div>
          <p className="muted">
            تقييم المجتمع لا يغيّر علاقتك بالمكان. تقييمك أنت هو الذي يجعله مجربًا في مكتبتك.
          </p>
        </article>
      </section>
    </main>
  );
}

function buildRelationship(place: Place | null): PlaceRelationship {
  return {
    listNames: place?.currentUserListNames ?? []
  };
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

  return signals.length > 0 ? signals : ["لا توجد علاقة شخصية محفوظة بعد"];
}

function relationshipHeadlineFor(place: Place, relationship: PlaceRelationship): string {
  const isSaved = relationship.listNames.length > 0;
  const isRated = Boolean(place.currentUserRating);

  if (isSaved && place.currentUserTried && isRated) {
    return "محفوظ ومجرّب ومقيّم في ذوقك";
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

  return "ينتظر سببًا ليدخل ذوقك";
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
