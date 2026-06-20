"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  Badge,
  BidiText,
  Button,
  ButtonLink,
  EmptyState,
  ListCard,
  LoadingState,
  PlaceCard,
  StatusMessage
} from "@/components/ui";
import {
  ApiError,
  ListDetail,
  Profile,
  ProfileRating,
  UserList,
  apiCollection,
  apiRequest,
  clearTokens,
  getAccessToken
} from "@/lib/api";

type ProfileStat = {
  label: string;
  unit: string;
  value: number;
};

export function ProfileArchivePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicLists, setPublicLists] = useState<ListDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publicListsError, setPublicListsError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadProfile = useCallback(async () => {
    setError("");
    setPublicListsError("");
    setNeedsAuth(false);
    setLoading(true);

    if (!getAccessToken()) {
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
        setError(caught instanceof ApiError ? caught.message : "تعذر تحميل أرشيف ذوقك.");
      }
      setLoading(false);
      return;
    }

    try {
      const ownedLists = await apiCollection<UserList>("/lists");
      setPublicLists(
        ownedLists.data
          .filter((list) => list.visibility === "public")
          .map((list) => ({ ...list, items: [] }))
      );
    } catch {
      setPublicListsError("تعذر تحميل رفوفك العامة. بقية الأرشيف ما زالت متاحة.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const stats = profile ? profileStats(profile) : [];
  const hasArchive = profile
    ? profile.triedPlaces.length > 0 || profile.userRatings.length > 0
    : false;

  return (
    <main className="content profile-page">
      <section className="profile-hero" aria-labelledby="profile-title">
        <div className="profile-hero__copy">
          <p className="eyebrow">أرشيف ذوقك</p>
          <h1 id="profile-title">ملفي</h1>
          <p className="muted">
            مساحة لما جربته وقيّمته وملاحظاتك الخاصة. ليست صفحة حساب، بل أثر ذوقك مع الوقت.
          </p>
        </div>
        {profile ? (
          <div className="profile-stats" aria-label="ملخص أرشيف الذوق">
            {stats.map((stat) => (
              <div
                aria-label={`${stat.label}: ${stat.value} ${stat.unit}`}
                className="profile-stat"
                key={stat.label}
              >
                <span className="profile-stat__value">{stat.value}</span>
                <span className="profile-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {needsAuth ? (
        <StatusMessage tone="notice">
          سجّل الدخول لعرض أرشيف ذوقك. <Link href="/login">تسجيل الدخول</Link>
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

      {!loading && profile && !hasArchive ? (
        <EmptyState
          action={<ButtonLink href="/restaurants">افتح المطاعم</ButtonLink>}
          body="قيّم مكانًا بعد تجربته ليظهر هنا. يبدأ الأرشيف من علاقتك بالمكان، لا من إعدادات الحساب."
          title="يبدأ أرشيفك بالتقييم"
        />
      ) : null}

      {!loading && profile && hasArchive ? (
        <>
          <section className="profile-section" aria-labelledby="profile-tried-title">
            <div className="library-section__header">
              <p className="eyebrow">ذاكرة مجرّبة</p>
              <h2 id="profile-tried-title">أماكن صارت جزءًا من ذوقك</h2>
            </div>
            {profile.triedPlaces.length === 0 ? (
              <p className="muted">لم يظهر مكان مجرّب بعد.</p>
            ) : (
              <div className="profile-place-grid" aria-label="الأماكن التي جربتها">
                {profile.triedPlaces.map((place) => (
                  <PlaceCard
                    actions={
                      <>
                        <ButtonLink href={`/places/${place.id}`} variant="secondary">
                          افتح المكان
                        </ButtonLink>
                        <ButtonLink href={`/places/${place.id}/rate`} variant="secondary">
                          حدّث التقييم
                        </ButtonLink>
                      </>
                    }
                    key={place.id}
                    place={place}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="profile-section" aria-labelledby="profile-ratings-title">
            <div className="library-section__header">
              <p className="eyebrow">تقييماتك</p>
              <h2 id="profile-ratings-title">الدرجات والملاحظات الخاصة</h2>
            </div>
            {profile.userRatings.length === 0 ? (
              <p className="muted">لم تحفظ أي تقييم بعد.</p>
            ) : (
              <div className="profile-rating-list" aria-label="تقييماتك الخاصة">
                {profile.userRatings.map((rating) => (
                  <RatingArchiveCard key={rating.id} rating={rating} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      {!loading && profile ? (
        <section className="profile-section" aria-labelledby="profile-public-title">
          <div className="library-section__header library-section__header--inline">
            <div>
              <p className="eyebrow">رفوف عامة</p>
              <h2 id="profile-public-title">ما يظهر للآخرين من قوائمك</h2>
            </div>
            <ButtonLink href="/lists/public" variant="secondary">
              القوائم العامة
            </ButtonLink>
          </div>
          {publicListsError ? <StatusMessage tone="notice">{publicListsError}</StatusMessage> : null}
          {publicLists.length === 0 ? (
            <p className="muted">لا توجد رفوف عامة من قوائمك حاليًا.</p>
          ) : (
            <div className="library-grid" aria-label="رفوفك العامة">
              {publicLists.map((list) => (
                <ListCard
                  href={`/lists/${list.id}`}
                  isEmpty={list.placeCount === 0}
                  key={list.id}
                  list={list}
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

function RatingArchiveCard({ rating }: { rating: ProfileRating }) {
  return (
    <article
      aria-label={`${rating.place.name}، تقييمك ${rating.rating} من 10${
        rating.notes ? "، ملاحظة خاصة" : ""
      }`}
      className="profile-rating-card"
    >
      <span aria-hidden="true" className="profile-rating-card__spine" />
      <div className="profile-rating-card__main">
        <h3>
          <BidiText>{rating.place.name}</BidiText>
        </h3>
        <div className="profile-rating-card__meta">
          <Badge variant="rating">تقييمك {rating.rating}/10</Badge>
          <Badge>جربته</Badge>
        </div>
      </div>
      {rating.notes ? (
        <p className="profile-private-note">
          <span>ملاحظتك الخاصة</span>
          <BidiText>{rating.notes}</BidiText>
        </p>
      ) : (
        <p className="muted">لا توجد ملاحظة خاصة لهذا التقييم.</p>
      )}
      <div className="actions">
        <ButtonLink href={`/places/${rating.place.id}/rate`} variant="secondary">
          حدّث التقييم
        </ButtonLink>
      </div>
    </article>
  );
}

function ProfileLoadingState() {
  return (
    <section className="profile-loading" aria-label="جاري تحميل أرشيف ذوقك">
      <LoadingState count={4} delayMs={0} label="جاري تحميل إحصاءات الملف" variant="text" />
      <LoadingState count={3} delayMs={0} label="جاري تحميل أماكنك المجربة" />
    </section>
  );
}

function profileStats(profile: Profile): ProfileStat[] {
  return [
    { label: "قوائم", unit: "قائمة", value: profile.listCount },
    { label: "مطاعم مجربة", unit: "مطعم", value: profile.triedRestaurantCount },
    { label: "مقاهٍ مجربة", unit: "مقهى", value: profile.triedCafeCount },
    { label: "تقييمات", unit: "تقييم", value: profile.ratingsCreatedCount }
  ];
}
