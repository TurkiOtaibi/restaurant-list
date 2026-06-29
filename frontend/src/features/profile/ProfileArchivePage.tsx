"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Badge,
  BidiText,
  Button,
  ButtonLink,
  EmptyState,
  ListCard,
  LoadingState,
  PlaceTypeIcon,
  StatusMessage
} from "@/components/ui";
import {
  ApiError,
  Profile,
  ProfileRating,
  apiRequest,
  clearTokens,
  ensureSession,
  logout
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";
import { formatNumber, formatOutOfTen } from "@/lib/numerals";

type ProfileStat = {
  label: string;
  unit: string;
  value: number;
};

const ARCHIVE_VIRTUALIZATION_THRESHOLD = 80;
const ARCHIVE_ROW_HEIGHT = 104;
const ARCHIVE_OVERSCAN = 4;
const RATING_NOTE_SESSION_PREFIX = "restaurantWishlist.ratingNote.";

export function ProfileArchivePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const result = await logout();
    router.push(result.confirmed ? "/" : "/?logout=unconfirmed");
  }

  const loadProfile = useCallback(async () => {
    setError("");
    setNeedsAuth(false);
    setLoading(true);

    if (!(await ensureSession())) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    try {
      const profileResponse = await apiRequest<Profile>("/profile");
      setProfile(profileResponse);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else {
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل صفحتك.");
      }
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const stats = profile ? profileStats(profile) : [];
  const hasRatings = profile ? profile.userRatings.length > 0 : false;
  const publicLists = profile?.publicListsSummary ?? [];

  return (
    <main className="content profile-page">
      <section className="profile-hero" aria-labelledby="profile-title">
        <div className="profile-hero__copy">
          <h1 id="profile-title">صفحتي</h1>
          <p className="muted">قوائمك وتقييماتك</p>
        </div>
        {!needsAuth ? (
          <Button onClick={() => void handleLogout()} type="button" variant="secondary">
            تسجيل الخروج
          </Button>
        ) : null}
        {profile ? (
          <div className="profile-stats" aria-label="ملخص الصفحة">
            {stats.map((stat) => (
              <div
                aria-label={`${stat.label}: ${formatNumber(stat.value)} ${stat.unit}`}
                className="profile-stat"
                key={stat.label}
              >
                <span className="profile-stat__value">{formatNumber(stat.value)}</span>
                <span className="profile-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض صفحتك. <Link href={loginHrefForReturn("/profile")}>تسجيل الدخول</Link>
        </StatusMessage>
      ) : null}

      {loading ? <ProfileLoadingState /> : null}

      {error ? (
        <section className="retry-panel" aria-labelledby="profile-error-title">
          <StatusMessage tone="error">
            <span id="profile-error-title">{error}</span>
          </StatusMessage>
          <Button onClick={() => void loadProfile()} type="button" variant="secondary">
            حاول مرة أخرى
          </Button>
        </section>
      ) : null}

      {!loading && profile ? (
        <section className="profile-section" aria-labelledby="profile-ratings-title">
          <div className="library-section__header">
            <h2 id="profile-ratings-title">تقييماتك</h2>
          </div>
          {hasRatings ? (
            <RatingArchiveList ratings={profile.userRatings} />
          ) : (
            <EmptyState
              action={<ButtonLink href="/places">الأماكن</ButtonLink>}
              title="لا توجد تقييمات"
            />
          )}
        </section>
      ) : null}

      {!loading && profile ? (
        <section className="profile-section" aria-labelledby="profile-public-title">
          <div className="library-section__header library-section__header--inline">
            <div>
              <h2 id="profile-public-title">قوائم عامة</h2>
            </div>
            <ButtonLink href="/lists/public" variant="secondary">
              القوائم العامة
            </ButtonLink>
          </div>
          {publicLists.length === 0 ? (
            <p className="muted">لا توجد قوائم عامة حاليًا.</p>
          ) : (
            <div className="library-grid" aria-label="قوائمك العامة">
              {publicLists.map((list) => (
                <ListCard
                  context="viewer"
                  href={`/lists/public/${list.id}`}
                  isEmpty={list.placeCount === 0}
                  key={list.id}
                  list={{ ...list, visibility: "public" }}
                  placeCount={list.placeCount}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}

function RatingArchiveList({ ratings }: { ratings: ProfileRating[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(520);

  useEffect(() => {
    const current = containerRef.current;
    if (!current || ratings.length <= ARCHIVE_VIRTUALIZATION_THRESHOLD) {
      return;
    }
    const updateHeight = () => setViewportHeight(current.clientHeight || 520);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(current);
    return () => observer.disconnect();
  }, [ratings.length]);

  if (ratings.length <= ARCHIVE_VIRTUALIZATION_THRESHOLD) {
    return (
      <div className="profile-rating-list" aria-label="تقييماتك الخاصة">
        {ratings.map((rating) => (
          <RatingArchiveCard key={rating.id} rating={rating} />
        ))}
      </div>
    );
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / ARCHIVE_ROW_HEIGHT) - ARCHIVE_OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ARCHIVE_ROW_HEIGHT) + ARCHIVE_OVERSCAN * 2;
  const endIndex = Math.min(ratings.length, startIndex + visibleCount);
  const visibleRatings = ratings.slice(startIndex, endIndex);

  return (
    <div
      aria-label="تقييماتك الخاصة"
      className="profile-rating-list profile-rating-list--virtualized"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      ref={containerRef}
    >
      <div
        aria-hidden="true"
        className="profile-rating-list__spacer"
        style={{ height: ratings.length * ARCHIVE_ROW_HEIGHT }}
      />
      <div
        className="profile-rating-list__window"
        style={{ transform: `translateY(${startIndex * ARCHIVE_ROW_HEIGHT}px)` }}
      >
        {visibleRatings.map((rating) => (
          <RatingArchiveCard key={rating.id} rating={rating} />
        ))}
      </div>
    </div>
  );
}

function RatingArchiveCard({ rating }: { rating: ProfileRating }) {
  const metadata = [rating.place.type, rating.place.subtype].filter(Boolean).join(" · ");

  function rememberPrivateNote() {
    if (typeof window === "undefined") {
      return;
    }
    window.sessionStorage.setItem(
      `${RATING_NOTE_SESSION_PREFIX}${rating.place.id}`,
      rating.notes ?? ""
    );
  }

  return (
    <article
      aria-label={`${rating.place.name}، تقييمك ${formatOutOfTen(rating.rating)}${
        rating.notes ? "، ملاحظة خاصة" : ""
      }`}
      className="profile-rating-card"
    >
      <PlaceTypeIcon type={rating.place.type} />
      <div className="profile-rating-card__main">
        <h3>
          <BidiText>{rating.place.name}</BidiText>
        </h3>
        <div className="profile-rating-card__meta">
          <Badge variant="rating">تقييمك {formatOutOfTen(rating.rating)}</Badge>
          <Badge>جربته</Badge>
          {metadata ? <span className="profile-rating-card__type-meta">{metadata}</span> : null}
        </div>
      </div>
      {rating.notes ? (
        <p className="profile-private-note">
          <span>ملاحظتك الخاصة</span>
          <BidiText>{rating.notes}</BidiText>
        </p>
      ) : null}
      <div className="actions">
        <ButtonLink
          href={`/places/${rating.place.id}/rate`}
          onClick={rememberPrivateNote}
          variant="secondary"
        >
          تعديل
        </ButtonLink>
      </div>
    </article>
  );
}

function ProfileLoadingState() {
  return (
    <section className="profile-loading" aria-label="جاري تحميل صفحتك">
      <LoadingState count={4} delayMs={0} label="جاري تحميل إحصاءات الملف" variant="text" />
      <LoadingState count={3} delayMs={0} label="جاري تحميل أماكنك المجربة" />
    </section>
  );
}

function profileStats(profile: Profile): ProfileStat[] {
  return [
    { label: "قوائم", unit: "قائمة", value: profile.listsCount ?? profile.listCount ?? 0 },
    { label: "مطاعم مجربة", unit: "مطعم", value: profile.triedRestaurantCount },
    { label: "مقاهٍ مجربة", unit: "مقهى", value: profile.triedCafeCount },
    { label: "آيس كريم مجرب", unit: "محل", value: profile.triedIceCreamCount },
    { label: "تقييمات", unit: "تقييم", value: profile.ratingsCount ?? profile.ratingsCreatedCount ?? 0 }
  ];
}
