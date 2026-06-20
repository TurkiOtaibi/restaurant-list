"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";

import { BottomSheet, Button, Modal, StatusMessage, TextInput } from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, Place, apiRequest } from "@/lib/api";
import { cx } from "@/lib/ui";

type PlaceType = "restaurant" | "cafe";

type CreatePlaceDialogProps = {
  initialType: PlaceType;
  onClose: (type: PlaceType) => void;
  open: boolean;
};

export function CreatePlaceDialog({ initialType, onClose, open }: CreatePlaceDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<PlaceType>(initialType);
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [createdPlace, setCreatedPlace] = useState<Place | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasUnsavedChanges = Boolean(name.trim()) || type !== initialType;
  const returnHref = type === "cafe" ? "/cafes?focus=create-place" : "/restaurants?focus=create-place";
  const returnLabel = type === "cafe" ? "العودة للمقاهي" : "العودة للمطاعم";

  function showNameRequired(shouldFocus = true) {
    setNameError("اسم المكان مطلوب.");
    if (shouldFocus) {
      nameRef.current?.focus();
    }
  }

  async function submitPlace() {
    setNameError("");
    setFormError("");
    setCreatedPlace(null);

    if (!name.trim()) {
      showNameRequired();
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<Place>("/places", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), type })
      });
      setCreatedPlace(response);
      setName("");
    } catch (caught) {
      if (caught instanceof ApiError && (caught.status === 409 || caught.message.includes("exists"))) {
        setFormError("هذا المكان موجود بالفعل في مكتبة الأماكن.");
      } else {
        setFormError(caught instanceof ApiError ? caught.message : "تعذر حفظ المكان.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitPlace();
  }

  return (
    <Dialog
      confirmCloseMessage="كتبت مكانًا لم تحفظه بعد. هل تريد الإغلاق؟"
      hasUnsavedChanges={hasUnsavedChanges && !submitting && !createdPlace}
      initialFocusSelector="#place-name"
      labelledBy="create-place-title"
      onClose={() => onClose(type)}
      open={open}
      title="أضف مكانًا"
    >
      <form className="create-place-dialog form-surface__form" noValidate onSubmit={handleSubmit}>
        <p className="muted">أضف شيئًا يستحق أن تتذكره، لا سجلًا جديدًا في قاعدة بيانات.</p>
        <TextInput
          error={nameError}
          id="place-name"
          label="اسم المكان"
          name="name"
          onBlur={() => {
            if (!name.trim()) {
              showNameRequired(false);
            }
          }}
          onChange={(event) => {
            setName(event.target.value);
            setNameError("");
            setFormError("");
            setCreatedPlace(null);
          }}
          ref={nameRef}
          value={name}
        />
        <fieldset className="place-type-choice">
          <legend>نوع المكان</legend>
          <div className="place-type-choice__grid">
            <label className={cx("place-type-choice__option", type === "restaurant" && "is-selected")}>
              <input
                checked={type === "restaurant"}
                name="place-type"
                onChange={() => {
                  setType("restaurant");
                  setCreatedPlace(null);
                }}
                type="radio"
                value="restaurant"
              />
              <span>مطعم</span>
              <small>وجبة أو عشاء بقي في بالك.</small>
            </label>
            <label className={cx("place-type-choice__option", type === "cafe" && "is-selected")}>
              <input
                checked={type === "cafe"}
                name="place-type"
                onChange={() => {
                  setType("cafe");
                  setCreatedPlace(null);
                }}
                type="radio"
                value="cafe"
              />
              <span>مقهى</span>
              <small>جلسة أو قهوة تستحق العودة.</small>
            </label>
          </div>
        </fieldset>
        {createdPlace ? (
          <StatusMessage tone="success">
            حفظنا <strong>{createdPlace.name}</strong> كشيء يستحق التذكر.{" "}
            <Link href={returnHref}>{returnLabel}</Link>
          </StatusMessage>
        ) : null}
        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
        <div className="form-surface__footer">
          <Button
            className="ds-button--full"
            isLoading={submitting}
            onPointerDown={(event) => {
              if (!name.trim()) {
                event.preventDefault();
                showNameRequired();
              }
            }}
            onClick={() => {
              if (!name.trim()) {
                showNameRequired();
                return;
              }

              void submitPlace();
            }}
            type="button"
          >
            حفظ المكان
          </Button>
          <Button onClick={() => onClose(type)} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
