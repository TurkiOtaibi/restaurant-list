"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import {
  BidiText,
  BottomSheet,
  Button,
  Modal,
  RatingControl,
  StatusMessage,
  TextArea
} from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  ApiError,
  Place,
  Rating,
  apiRequest,
  clearTokens,
  ensureSession,
  isSessionRecoveryError
} from "@/lib/api";
import { loginHrefForReturn } from "@/lib/authReturn";

type RatePlaceDialogProps = {
  onClose: (place: Place | null) => void;
  open: boolean;
  placeId: string;
};

const RATING_NOTE_SESSION_PREFIX = "restaurantWishlist.ratingNote.";

export function RatePlaceDialog({ onClose, open, placeId }: RatePlaceDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const [place, setPlace] = useState<Place | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [initialRating, setInitialRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [initialNotes, setInitialNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const hasUnsavedChanges =
    !submitting && !success && (rating !== initialRating || notes !== initialNotes);

  useEffect(() => {
    let active = true;

    async function loadPlace() {
      setLoading(true);
      setFormError("");
      try {
        if (!(await ensureSession())) {
          setNeedsAuth(true);
          setLoading(false);
          return;
        }

        const response = await apiRequest<Place>(`/places/${placeId}`);
        if (!active) {
          return;
        }
        setPlace(response);
        setRating(response.currentUserRating);
        setInitialRating(response.currentUserRating);
        const storedNote =
          response.currentUserRating && typeof window !== "undefined"
            ? window.sessionStorage.getItem(`${RATING_NOTE_SESSION_PREFIX}${placeId}`) ?? ""
            : "";
        setNotes(storedNote);
        setInitialNotes(storedNote);
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 401) {
          clearTokens();
          setNeedsAuth(true);
        } else if (isSessionRecoveryError(caught)) {
          setFormError("تعذر استعادة الجلسة. حاول مرة أخرى.");
        } else if (active) {
          setFormError(caught instanceof ApiError ? caught.message : "تعذر تحميل المكان.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (open) {
      void loadPlace();
    }

    return () => {
      active = false;
    };
  }, [open, placeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    if (!rating) {
      setRatingError("اختر تقييمًا من 1 إلى 10.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        notes: notes.trim() ? notes.trim() : null
      };
      const response = place?.currentUserRating
        ? await apiRequest<Rating>(`/ratings/${placeId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          })
        : await apiRequest<Rating>("/ratings", {
            method: "POST",
            body: JSON.stringify({ ...payload, placeId })
          });
      const refreshed = await apiRequest<Place>(`/places/${placeId}`);

      setPlace(refreshed);
      setRating(response.rating);
      setInitialRating(response.rating);
      setNotes("");
      setInitialNotes(response.notes ?? "");
      setSuccess("تم حفظ التقييم.");
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "تعذر حفظ التقييم.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      confirmCloseMessage="لديك تقييم لم تحفظه بعد. هل تريد الإغلاق؟"
      hasUnsavedChanges={hasUnsavedChanges}
      initialFocusSelector="#rating-control"
      labelledBy="rate-place-title"
      onClose={() => onClose(place)}
      open={open}
      title="قيّم المكان"
    >
      <form className="rate-place-dialog form-surface__form" noValidate onSubmit={handleSubmit}>
        {needsAuth ? (
          <StatusMessage tone="notice">
            سجّل الدخول لتقييم هذا المكان. <Link href={loginHrefForReturn(`/places/${placeId}/rate`)}>تسجيل الدخول</Link>
          </StatusMessage>
        ) : null}

        {loading ? (
          <div className="rate-place-dialog__loading" aria-live="polite" role="status">
            جاري تحميل المكان
          </div>
        ) : null}

        {place ? (
          <>
            <div className="rate-place-dialog__place">
              <p className="eyebrow">تقييم المكان</p>
              <h2>
                <BidiText>{place.name}</BidiText>
              </h2>
            </div>

            <RatingControl
              consequenceMessage="لن يغيّر التقييم قوائمك أو عضوية هذا المكان فيها."
              error={ratingError}
              id="rating-control"
              name="place-rating"
              onChange={(value) => {
                setRating(value);
                setRatingError("");
                setSuccess("");
              }}
              required
              value={rating}
            />

            <TextArea
              helper="ملاحظتك خاصة"
              id="rating-notes"
              label="ملاحظتك"
              name="notes"
              onChange={(event) => {
                setNotes(event.target.value);
                setSuccess("");
              }}
              rows={4}
              value={notes}
            />
          </>
        ) : null}

        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}

        <div className="form-surface__footer">
          <Button className="ds-button--full" isLoading={submitting} type="submit">
            حفظ التقييم
          </Button>
          <Button onClick={() => onClose(place)} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
