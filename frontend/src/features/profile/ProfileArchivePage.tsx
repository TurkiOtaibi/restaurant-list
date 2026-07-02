"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActionMenu,
  BidiText,
  Button,
  ButtonLink,
  EmptyState,
  LoadingState,
  MoreVerticalIcon,
  NumberText,
  PlaceTypeIcon,
  RatingDisplay,
  ResponsiveDialog,
  StatusMessage,
  TextArea,
  TextInput
} from "@/components/ui";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";
import {
  ApiError,
  Profile,
  ProfileFavoritePlace,
  ProfileRating,
  apiRequest,
  clearTokens,
  ensureSession,
  isSessionRecoveryError,
  logout
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";
import { formatNumber, formatOutOfTen } from "@/lib/numerals";

type ProfileStat = {
  ariaLabel: string;
  label: string;
  value: string;
};

const ARCHIVE_VIRTUALIZATION_THRESHOLD = 80;
const ARCHIVE_ROW_HEIGHT = 104;
const ARCHIVE_OVERSCAN = 4;
const RATING_NOTE_SESSION_PREFIX = "restaurantWishlist.ratingNote.";
const PROFILE_DISPLAY_NAME_MAX_LENGTH = 80;
const PROFILE_BIO_MAX_LENGTH = 280;
const AVATAR_COLORS = [
  ["#0f8f5f", "#35d18e"],
  ["#1b6f8f", "#5dd5f1"],
  ["#8f6a1b", "#f2c95a"],
  ["#7c3f8f", "#d48df1"],
  ["#8f3d4a", "#ef8b98"]
] as const;

export function ProfileArchivePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
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

    try {
      if (!(await ensureSession())) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const profileResponse = await apiRequest<Profile>("/profile");
      setProfile(profileResponse);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        clearTokens();
        setNeedsAuth(true);
      } else if (isSessionRecoveryError(caught)) {
        setError("تعذر استعادة الجلسة. حاول مرة أخرى.");
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
  const canEditProfile = Boolean(profile && !needsAuth);

  return (
    <main className="content profile-page">
      <ProfileHeader
        canLogout={!needsAuth}
        onEdit={() => setEditOpen(true)}
        onLogout={() => {
          void handleLogout();
        }}
      />

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
        <>
          <ProfileIdentityCard
            bio={profile.bio}
            displayName={profile.displayName}
            onEdit={() => setEditOpen(true)}
          />
          <ProfileStats stats={stats} />
          <FavoritePlacesStrip
            favorites={profile.favoritePlaces}
            onUpdated={setProfile}
            ratedPlaces={profile.userRatings}
          />

          <section className="profile-section" aria-labelledby="profile-ratings-title">
            <div className="library-section__header">
              <h2 id="profile-ratings-title">الأماكن التي قيّمتها</h2>
            </div>
            {hasRatings ? (
              <RatingArchiveList ratings={profile.userRatings} />
            ) : (
              <EmptyState
                action={<ButtonLink href="/places">استكشف الأماكن</ButtonLink>}
                body="ابدأ من صفحة الأماكن، افتح مكانًا يعجبك، ثم أضف تقييمك الأول."
                title="لم تقيّم أي مكان بعد"
              />
            )}
          </section>

          <section className="profile-section" aria-labelledby="profile-lists-title">
            <div className="profile-section-link">
              <div>
                <h2 id="profile-lists-title">قوائمي</h2>
                <p className="muted">كل قوائمك الخاصة والعامة في مكان واحد.</p>
              </div>
              <ButtonLink href="/lists" variant="secondary">
                عرض القوائم
              </ButtonLink>
            </div>
          </section>
          <EditProfileDialog
            onClose={() => setEditOpen(false)}
            onUpdated={(updatedProfile) => {
              setProfile(updatedProfile);
              setEditOpen(false);
            }}
            open={editOpen && canEditProfile}
            profile={profile}
          />
        </>
      ) : null}
    </main>
  );
}

function ProfileHeader({
  canLogout,
  onEdit,
  onLogout
}: {
  canLogout: boolean;
  onEdit: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="profile-topbar" aria-labelledby="profile-title">
      <h1 id="profile-title">صفحتي</h1>
      {canLogout ? (
        <ActionMenu
          items={[
            { label: "تعديل الملف الشخصي", onSelect: onEdit },
            { destructive: true, label: "تسجيل الخروج", onSelect: onLogout }
          ]}
          label="إجراءات صفحتي"
          trigger={<MoreVerticalIcon />}
        />
      ) : null}
    </header>
  );
}

function ProfileIdentityCard({
  bio,
  displayName,
  onEdit
}: {
  bio: string | null;
  displayName: string;
  onEdit: () => void;
}) {
  const initials = displayInitials(displayName);
  const [avatarStart, avatarEnd] = avatarPalette(displayName);

  return (
    <section className="profile-identity-card" aria-labelledby="profile-identity-name">
      <div
        aria-hidden="true"
        className="profile-avatar"
        style={{
          "--profile-avatar-a": avatarStart,
          "--profile-avatar-b": avatarEnd
        } as CSSProperties}
      >
        {initials}
      </div>
      <div className="profile-identity-card__copy">
        <p className="eyebrow">الملف الشخصي</p>
        <h2 id="profile-identity-name">
          <BidiText>{displayName}</BidiText>
        </h2>
        {bio ? (
          <p className="profile-identity-card__bio">
            <BidiText>{bio}</BidiText>
          </p>
        ) : null}
        <div className="profile-identity-card__actions">
          <Button onClick={onEdit} type="button" variant="secondary">
            تعديل الملف الشخصي
          </Button>
        </div>
      </div>
    </section>
  );
}

function EditProfileDialog({
  onClose,
  onUpdated,
  open,
  profile
}: {
  onClose: () => void;
  onUpdated: (profile: Profile) => void;
  open: boolean;
  profile: Profile;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [displayNameError, setDisplayNameError] = useState("");
  const [bioError, setBioError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const bioLength = bio.length;

  useEffect(() => {
    if (!open) {
      return;
    }

    setDisplayName(profile.displayName);
    setBio(profile.bio ?? "");
    setDisplayNameError("");
    setBioError("");
    setFormError("");
    setSaving(false);
  }, [open, profile.bio, profile.displayName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const normalizedDisplayName = normalizeProfileDisplayName(displayName);
    const normalizedBio = bio.trim();
    const nextDisplayNameError = validateDisplayName(normalizedDisplayName);
    const nextBioError = validateBio(normalizedBio);

    setDisplayNameError(nextDisplayNameError);
    setBioError(nextBioError);

    if (nextDisplayNameError || nextBioError) {
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await apiRequest<Profile>("/profile", {
        body: JSON.stringify({
          bio: normalizedBio,
          displayName: normalizedDisplayName
        }),
        method: "PATCH"
      });
      onUpdated(updatedProfile);
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "تعذر حفظ الملف الشخصي.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveDialog
      closeLabel="إغلاق تعديل الملف الشخصي"
      initialFocusSelector="#edit-profile-display-name"
      labelledBy="edit-profile-title"
      onClose={onClose}
      open={open}
      title="تعديل الملف الشخصي"
    >
      <form className="profile-edit-form" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput
          autoComplete="name"
          error={displayNameError}
          id="edit-profile-display-name"
          label="الاسم"
          maxLength={PROFILE_DISPLAY_NAME_MAX_LENGTH}
          onChange={(event) => {
            setDisplayName(event.target.value);
            if (displayNameError) {
              setDisplayNameError(validateDisplayName(normalizeProfileDisplayName(event.target.value)));
            }
          }}
          required
          value={displayName}
        />
        <div className="profile-edit-form__bio">
          <TextArea
            error={bioError}
            helper="اختياري، حتى ٢٨٠ حرفًا."
            id="edit-profile-bio"
            label="البايو"
            maxLength={PROFILE_BIO_MAX_LENGTH}
            onChange={(event) => {
              setBio(event.target.value);
              if (bioError) {
                setBioError(validateBio(event.target.value.trim()));
              }
            }}
            rows={4}
            value={bio}
          />
          <p aria-live="polite" className="profile-edit-form__counter">
            <NumberText>{formatNumber(bioLength)}</NumberText>
            <span aria-hidden="true"> / </span>
            <NumberText>{formatNumber(PROFILE_BIO_MAX_LENGTH)}</NumberText>
            <span> حرف</span>
          </p>
        </div>
        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
        <div className="actions">
          <Button onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
          <Button isLoading={saving} loadingLabel="جاري حفظ الملف الشخصي" type="submit">
            حفظ
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}

function FavoritePlacesStrip({
  favorites,
  onUpdated,
  ratedPlaces
}: {
  favorites: ProfileFavoritePlace[];
  onUpdated: (profile: Profile) => void;
  ratedPlaces: ProfileRating[];
}) {
  const [editing, setEditing] = useState(false);
  const hasRatedPlaces = ratedPlaces.length > 0;

  return (
    <section className="profile-section profile-favorites" aria-labelledby="profile-favorites-title">
      <div className="library-section__header library-section__header--inline">
        <h2 id="profile-favorites-title">المفضلة</h2>
        {hasRatedPlaces ? (
          <Button onClick={() => setEditing(true)} type="button" variant="secondary">
            تعديل المفضلة
          </Button>
        ) : null}
      </div>
      {favorites.length > 0 ? (
        <div className="profile-favorites-grid" aria-label="الأماكن المفضلة">
          {favorites.map((favorite) => (
            <FavoritePlaceCard favorite={favorite} key={favorite.id} />
          ))}
        </div>
      ) : (
        <FavoritePlacesEmptyState
          canOpenPicker={hasRatedPlaces}
          onOpenPicker={() => setEditing(true)}
        />
      )}
      {hasRatedPlaces ? (
        <EditFavoritesDialog
          favorites={favorites}
          onClose={() => setEditing(false)}
          onUpdated={(profile) => {
            onUpdated(profile);
            setEditing(false);
          }}
          open={editing}
          ratedPlaces={ratedPlaces}
        />
      ) : null}
    </section>
  );
}

function FavoritePlaceCard({ favorite }: { favorite: ProfileFavoritePlace }) {
  return (
    <ButtonLink
      aria-label={`${favorite.name}، تقييمك ${formatOutOfTen(favorite.rating)}`}
      className="profile-favorite-card"
      href={`/places/${favorite.id}`}
      variant="secondary"
    >
      <PlaceTypeIcon type={favorite.type} />
      <span className="profile-favorite-card__name">
        <BidiText>{favorite.name}</BidiText>
      </span>
      <RatingDisplay
        className="profile-favorite-card__rating"
        label="تقييمك"
        variant="outOfTen"
        value={favorite.rating}
      />
    </ButtonLink>
  );
}

function FavoritePlacesEmptyState({
  canOpenPicker,
  onOpenPicker
}: {
  canOpenPicker: boolean;
  onOpenPicker: () => void;
}) {
  return (
    <div className="profile-favorites-empty">
      <div aria-hidden="true" className="profile-favorites-placeholders">
        {Array.from({ length: 4 }, (_, index) => (
          <span className="profile-favorite-placeholder" key={index} />
        ))}
      </div>
      {canOpenPicker ? (
        <Button onClick={onOpenPicker} type="button" variant="secondary">
          أضف مفضلتك الأولى
        </Button>
      ) : (
        <p className="muted">قيّم أماكن أولًا لتضيفها إلى المفضلة.</p>
      )}
    </div>
  );
}

function EditFavoritesDialog({
  favorites,
  onClose,
  onUpdated,
  open,
  ratedPlaces
}: {
  favorites: ProfileFavoritePlace[];
  onClose: () => void;
  onUpdated: (profile: Profile) => void;
  open: boolean;
  ratedPlaces: ProfileRating[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(favorites.map((favorite) => favorite.id));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const candidates = ratedPlaces.map((rating) => ({
    id: rating.place.id,
    name: rating.place.name,
    rating: rating.rating,
    subtype: rating.place.subtype,
    type: rating.place.type
  }));
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const selectedFavorites = selectedIds
    .map((id) => candidateById.get(id))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCandidates = normalizedQuery
    ? candidates.filter((candidate) => candidate.name.toLowerCase().includes(normalizedQuery))
    : candidates;

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedIds(favorites.map((favorite) => favorite.id));
    setQuery("");
    setMessage("");
    setServerError("");
    setSaving(false);
  }, [favorites, open]);

  function toggleFavorite(placeId: string) {
    setServerError("");
    setSelectedIds((current) => {
      if (current.includes(placeId)) {
        setMessage("");
        return current.filter((id) => id !== placeId);
      }

      if (current.length >= 4) {
        setMessage("يمكنك اختيار ٤ أماكن كحد أقصى.");
        return current;
      }

      setMessage("");
      return [...current, placeId];
    });
  }

  function moveSelected(placeId: string, direction: -1 | 1) {
    setSelectedIds((current) => {
      const index = current.indexOf(placeId);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function saveFavorites() {
    setSaving(true);
    setServerError("");
    setMessage("");
    try {
      const updatedProfile = await apiRequest<Profile>("/profile/favorites", {
        body: JSON.stringify({ placeIds: selectedIds }),
        method: "PUT"
      });
      onUpdated(updatedProfile);
    } catch (caught) {
      setServerError(caught instanceof ApiError ? caught.message : "تعذر حفظ المفضلة.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveDialog
      closeLabel="إغلاق تعديل المفضلة"
      initialFocusSelector="#favorite-search"
      labelledBy="edit-favorites-title"
      onClose={onClose}
      open={open}
      title="تعديل المفضلة"
    >
      <div className="profile-favorites-dialog">
        <TextInput
          id="favorite-search"
          label="البحث في الأماكن التي قيّمتها"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث باسم المكان"
          value={query}
        />
        <p className="profile-favorites-dialog__count" aria-live="polite">
          اخترت <NumberText>{formatNumber(selectedIds.length)}</NumberText> من{" "}
          <NumberText>{formatNumber(4)}</NumberText>
        </p>
        {message ? <StatusMessage tone="notice">{message}</StatusMessage> : null}
        {serverError ? <StatusMessage tone="error">{serverError}</StatusMessage> : null}

        {selectedFavorites.length > 0 ? (
          <div className="profile-favorites-selected" aria-label="ترتيب المفضلة المختارة">
            {selectedFavorites.map((favorite, index) => (
              <div className="profile-favorites-selected__row" key={favorite.id}>
                <span>
                  <NumberText>{formatNumber(index + 1)}</NumberText>.{" "}
                  <BidiText>{favorite.name}</BidiText>
                </span>
                <div className="actions">
                  <Button
                    aria-label={`ارفع ${favorite.name}`}
                    disabled={index === 0}
                    onClick={() => moveSelected(favorite.id, -1)}
                    type="button"
                    variant="secondary"
                  >
                    أعلى
                  </Button>
                  <Button
                    aria-label={`أنزل ${favorite.name}`}
                    disabled={index === selectedFavorites.length - 1}
                    onClick={() => moveSelected(favorite.id, 1)}
                    type="button"
                    variant="secondary"
                  >
                    أسفل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="profile-favorite-picker-list" aria-label="الأماكن التي قيّمتها">
          {filteredCandidates.map((candidate) => {
            const selected = selectedIds.includes(candidate.id);
            return (
              <button
                aria-pressed={selected}
                className="profile-favorite-picker-item"
                key={candidate.id}
                onClick={() => toggleFavorite(candidate.id)}
                type="button"
              >
                <PlaceTypeIcon type={candidate.type} />
                <span className="profile-favorite-picker-item__main">
                  <span className="profile-favorite-picker-item__name">
                    <BidiText>{candidate.name}</BidiText>
                  </span>
                  <RatingDisplay
                    className="profile-favorite-picker-item__rating"
                    label="تقييمك"
                    variant="outOfTen"
                    value={candidate.rating}
                  />
                </span>
                <span className="profile-favorite-picker-item__state">
                  {selected ? "مختار" : "اختيار"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="actions">
          <Button onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
          <Button isLoading={saving} loadingLabel="جاري حفظ المفضلة" onClick={() => void saveFavorites()} type="button">
            حفظ المفضلة
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

function ProfileStats({ stats }: { stats: ProfileStat[] }) {
  return (
    <section className="profile-stats" aria-label="ملخص صفحتي">
      {stats.map((stat) => (
        <div aria-label={stat.ariaLabel} className="profile-stat" key={stat.label}>
          <span className="profile-stat__value">
            <NumberText>{stat.value}</NumberText>
          </span>
          <span className="profile-stat__label">{stat.label}</span>
        </div>
      ))}
    </section>
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
      <div className="profile-rating-list" aria-label="الأماكن التي قيّمتها">
        {ratings.map((rating) => (
          <RatingArchiveCard key={rating.id} rating={rating} />
        ))}
      </div>
    );
  }

  const { startIndex, visibleRatings } = profileRatingWindow({
    ratings,
    scrollTop,
    viewportHeight
  });

  return (
    <div
      aria-label="الأماكن التي قيّمتها"
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

function profileRatingWindow({
  ratings,
  scrollTop,
  viewportHeight
}: {
  ratings: ProfileRating[];
  scrollTop: number;
  viewportHeight: number;
}) {
  const startIndex = Math.max(0, Math.floor(scrollTop / ARCHIVE_ROW_HEIGHT) - ARCHIVE_OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ARCHIVE_ROW_HEIGHT) + ARCHIVE_OVERSCAN * 2;
  const endIndex = Math.min(ratings.length, startIndex + visibleCount);

  return {
    startIndex,
    visibleRatings: ratings.slice(startIndex, endIndex)
  };
}

function RatingArchiveCard({ rating }: { rating: ProfileRating }) {
  const metadata = [placeTypeLabel(rating.place.type), placeSubtypeLabel(rating.place.subtype)]
    .filter(Boolean)
    .join(" · ");

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
          <RatingDisplay
            className="profile-rating-card__score"
            label="تقييمك"
            variant="outOfTen"
            value={rating.rating}
          />
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
      <LoadingState count={2} delayMs={0} label="جاري تحميل هوية الصفحة" variant="text" />
      <LoadingState count={3} delayMs={0} label="جاري تحميل الأماكن التي قيّمتها" />
    </section>
  );
}

function profileStats(profile: Profile): ProfileStat[] {
  const ratingsCount = profile.ratingsCount ?? profile.ratingsCreatedCount ?? 0;
  const listsCount = profile.listsCount ?? profile.listCount ?? 0;
  const stats: ProfileStat[] = [
    {
      ariaLabel: `التقييمات: ${formatNumber(ratingsCount)}`,
      label: "التقييمات",
      value: formatNumber(ratingsCount)
    },
    {
      ariaLabel: `القوائم: ${formatNumber(listsCount)}`,
      label: "القوائم",
      value: formatNumber(listsCount)
    }
  ];

  if (profile.averageRating !== null) {
    stats.push({
      ariaLabel: `متوسط التقييم: ${formatOutOfTen(profile.averageRating)}`,
      label: "متوسط التقييم",
      value: formatOutOfTen(profile.averageRating)
    });
  }

  return stats;
}

function displayInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => Array.from(part)[0] ?? "");
  return initials.join("") || "س";
}

function avatarPalette(value: string): (typeof AVATAR_COLORS)[number] {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function normalizeProfileDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function validateDisplayName(value: string): string {
  if (!value) {
    return "الاسم مطلوب";
  }

  if (value.length > PROFILE_DISPLAY_NAME_MAX_LENGTH) {
    return "الاسم يجب ألا يتجاوز ٨٠ حرفًا";
  }

  return "";
}

function validateBio(value: string): string {
  if (value.length > PROFILE_BIO_MAX_LENGTH) {
    return "البايو يجب ألا يتجاوز ٢٨٠ حرفًا";
  }

  return "";
}
