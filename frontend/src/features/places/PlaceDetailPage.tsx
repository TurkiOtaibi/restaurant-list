"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ActionMenu,
  AddIcon,
  ArrowLeftIcon,
  BidiText,
  BookmarkIcon,
  Button,
  ButtonLink,
  Chip,
  EmptyState,
  LoadingState,
  MoreVerticalIcon,
  PlaceImage,
  RatingDisplay,
  ResponsiveDialog,
  StatusMessage
} from "@/components/ui";
import {
  ApiError,
  ListDetail,
  Place,
  Profile,
  apiRequest,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistError, setWishlistError] = useState("");
  const [updatingWishlist, setUpdatingWishlist] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const [removingImage, setRemovingImage] = useState(false);

  const loadPlace = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const restoredToken = await ensureSession().catch(() => null);
      setIsAuthenticated(Boolean(restoredToken));

      const placeResponse = await apiRequest<Place>(`/places/${placeId}`, {
        auth: "optional"
      });
      setPlace(placeResponse);
      if (restoredToken) {
        const profileResponse = await apiRequest<Profile>("/profile");
        setWishlistId(profileResponse.wishlist?.id ?? null);
      } else {
        setWishlistId(null);
      }
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError(caught.message);
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
  const currentPlaceId = place.id;
  const isInWishlist = Boolean(wishlistId && place.currentUserListIds.includes(wishlistId));
  const rateHref = isAuthenticated
    ? `/places/${currentPlaceId}/rate`
    : loginHrefForReturn(`/places/${currentPlaceId}/rate`);

  function openAddToList() {
    if (!isAuthenticated) {
      window.location.href = loginHrefForReturn(`/places/${currentPlaceId}`);
      return;
    }
    setAddToListOpen(true);
  }

  const menuItems = [
    ...(place.currentUserIsCreator
      ? [
          {
            label: "تعديل",
            onSelect: () => setImageDialogOpen(true)
          },
          {
            destructive: true,
            label: "حذف",
            onSelect: () => {
              if (place.imageUrl) {
                void removeImage(place.id);
              }
            }
          }
        ]
      : [])
  ];

  async function removeImage(placeIdToRemove: string) {
    setImageError("");
    setImageMessage("");
    setRemovingImage(true);
    try {
      const updatedPlace = await apiRequest<Place>(`/places/${placeIdToRemove}/image`, {
        method: "DELETE"
      });
      setPlace(updatedPlace);
      setImageMessage("تمت إزالة الصورة.");
    } catch (caught) {
      setImageError(caught instanceof ApiError ? caught.message : "تعذرت إزالة الصورة.");
    } finally {
      setRemovingImage(false);
    }
  }

  async function toggleWishlist() {
    if (!place) {
      return;
    }
    if (!isAuthenticated) {
      window.location.href = loginHrefForReturn(`/places/${currentPlaceId}`);
      return;
    }

    setWishlistError("");
    setWishlistMessage("");
    setUpdatingWishlist(true);
    try {
      const updatedWishlist = isInWishlist
        ? await apiRequest<ListDetail>(`/wishlist/places/${place.id}`, { method: "DELETE" })
        : await apiRequest<ListDetail>("/wishlist/places", {
            body: JSON.stringify({ placeId: place.id }),
            method: "POST"
          });
      setWishlistId(updatedWishlist.id);
      const updatedPlace = await apiRequest<Place>(`/places/${place.id}`);
      setPlace(updatedPlace);
      setWishlistMessage(isInWishlist ? "أزيل من رغباتي." : "أضيف إلى رغباتي.");
    } catch (caught) {
      setWishlistError(caught instanceof ApiError ? caught.message : "تعذر تحديث رغباتي.");
    } finally {
      setUpdatingWishlist(false);
    }
  }

  return (
    <main className="content place-detail-page">
      <div className="place-detail-topbar" aria-label="إجراءات المكان">
        <ButtonLink aria-label="العودة للأماكن" className="place-detail-topbar__action" href="/places" variant="secondary">
          <ArrowLeftIcon />
        </ButtonLink>
        {menuItems.length > 0 ? (
          <ActionMenu
            items={menuItems}
            label="خيارات إدارة المكان"
            trigger={<MoreVerticalIcon />}
          />
        ) : null}
      </div>
      {imageMessage ? <StatusMessage tone="success">{imageMessage}</StatusMessage> : null}
      {imageError ? <StatusMessage tone="error">{imageError}</StatusMessage> : null}
      {wishlistMessage ? <StatusMessage tone="success">{wishlistMessage}</StatusMessage> : null}
      {wishlistError ? <StatusMessage tone="error">{wishlistError}</StatusMessage> : null}
      {removingImage ? (
        <StatusMessage tone="notice">جاري إزالة الصورة.</StatusMessage>
      ) : null}
      <section aria-labelledby="place-detail-title" className="place-detail-hero">
        <PlaceImage
          className="place-detail-hero__art"
          imageUrl={place.imageUrl}
          type={place.type}
        />
        <div className="place-detail-hero__content">
          <h1 id="place-detail-title">
            <BidiText>{place.name}</BidiText>
          </h1>
          <div className="place-detail-hero__chips" aria-label="نوع المكان">
            <Chip>{placeTypeLabel(place.type)}</Chip>
            {subtype ? <Chip>{subtype}</Chip> : null}
          </div>
          <div className="actions place-detail-hero__actions">
            <Button
              className="ds-button--full place-detail-hero__cta place-detail-hero__cta--primary"
              isLoading={updatingWishlist}
              onClick={() => void toggleWishlist()}
              type="button"
            >
              <span className="place-detail-hero__cta-content">
                <BookmarkIcon />
                <span>{isInWishlist ? "في رغباتي" : "أضف إلى رغباتي"}</span>
              </span>
            </Button>
            <Button
              className="ds-button--full place-detail-hero__cta place-detail-hero__cta--secondary"
              onClick={openAddToList}
              type="button"
              variant="secondary"
            >
              <span className="place-detail-hero__cta-content">
                <AddIcon />
                <span>أضف إلى قائمة</span>
              </span>
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
              <p className="muted">لم تضف تقييمًا لهذا المكان بعد.</p>
            )}
            <ButtonLink href={rateHref} variant="secondary">
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
      </section>

      {addToListOpen ? (
        <SavePlaceToListDialog
          onClose={() => setAddToListOpen(false)}
          onSaved={(updatedPlace) => setPlace(updatedPlace)}
          open
          place={place}
        />
      ) : null}
      {imageDialogOpen ? (
        <PlaceImageDialog
          onClose={() => setImageDialogOpen(false)}
          onSaved={(updatedPlace) => {
            setPlace(updatedPlace);
            setImageDialogOpen(false);
            setImageMessage("تم حفظ الصورة.");
          }}
          open
          place={place}
        />
      ) : null}
    </main>
  );
}

function PlaceImageDialog({
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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file]);

  function selectFile(nextFile: File | undefined) {
    setError("");
    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(nextFile.type)) {
      setFile(null);
      setError("الصورة يجب أن تكون JPEG أو PNG أو WebP.");
      return;
    }

    if (nextFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("حجم الصورة يجب ألا يتجاوز ٥ ميجابايت.");
      return;
    }

    setFile(nextFile);
  }

  async function saveImage() {
    if (!file) {
      setError("اختر صورة أولًا.");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    setSaving(true);
    setError("");
    try {
      const updatedPlace = await apiRequest<Place>(`/places/${place.id}/image`, {
        body,
        method: "PUT"
      });
      onSaved(updatedPlace);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر حفظ الصورة.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveDialog
      closeLabel="إغلاق إدارة الصورة"
      initialFocusSelector="#place-image-file"
      labelledBy="place-image-dialog-title"
      onClose={onClose}
      open={open}
      title={place.imageUrl ? "تغيير الصورة" : "أضف صورة"}
    >
      <div className="place-image-dialog">
        <label className="place-image-dialog__picker" htmlFor="place-image-file">
          <span>الصورة</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            id="place-image-file"
            onChange={(event) => selectFile(event.target.files?.[0])}
            type="file"
          />
        </label>
        {previewUrl ? (
          <span className="place-image-dialog__preview" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- Local object URL previews need native image rendering before upload. */}
            <img alt="" src={previewUrl} />
          </span>
        ) : (
          <PlaceImage
            className="place-image-dialog__preview"
            imageUrl={place.imageUrl}
            type={place.type}
          />
        )}
        <p className="muted">JPEG أو PNG أو WebP، حتى ٥ ميجابايت.</p>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <div className="actions">
          <Button onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
          <Button isLoading={saving} loadingLabel="جاري رفع الصورة" onClick={() => void saveImage()} type="button">
            حفظ الصورة
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
