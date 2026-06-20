"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { BottomSheet, Button, Field, Modal, StatusMessage, TextInput } from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, Place, apiRequest } from "@/lib/api";

import {
  cafeSubtypeOptions,
  createPlaceTypeOptions,
  PlaceSubtype,
  PlaceType,
  restaurantSubtypeOptions
} from "./taxonomy";

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
  const [subtype, setSubtype] = useState<PlaceSubtype | "">("");
  const [nameError, setNameError] = useState("");
  const [subtypeError, setSubtypeError] = useState("");
  const [formError, setFormError] = useState("");
  const [createdPlace, setCreatedPlace] = useState<Place | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasUnsavedChanges = Boolean(name.trim()) || type !== initialType || Boolean(subtype);

  useEffect(() => {
    setType(initialType);
    setSubtype("");
  }, [initialType, open]);

  function showNameRequired(shouldFocus = true) {
    setNameError("اسم المكان مطلوب.");
    if (shouldFocus) {
      nameRef.current?.focus();
    }
  }

  function validateSubtype(): boolean {
    if (type === "ice_cream") {
      setSubtypeError("");
      return true;
    }

    if (!subtype) {
      setSubtypeError(type === "restaurant" ? "نوع المطعم مطلوب." : "نوع المقهى مطلوب.");
      return false;
    }

    setSubtypeError("");
    return true;
  }

  async function submitPlace() {
    setNameError("");
    setFormError("");
    setCreatedPlace(null);

    if (!name.trim()) {
      showNameRequired();
      return;
    }

    if (!validateSubtype()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<Place>("/places", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          type,
          subtype: type === "ice_cream" ? null : subtype
        })
      });
      setCreatedPlace(response);
      setName("");
      setSubtype("");
    } catch (caught) {
      if (caught instanceof ApiError && (caught.status === 409 || caught.message.includes("exists"))) {
        setFormError("المكان موجود بالفعل.");
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
      confirmCloseMessage="لديك تغييرات غير محفوظة. هل تريد الإغلاق؟"
      hasUnsavedChanges={hasUnsavedChanges && !submitting && !createdPlace}
      initialFocusSelector="#place-name"
      labelledBy="create-place-title"
      onClose={() => onClose(type)}
      open={open}
      title="أضف مكانًا"
    >
      <form className="create-place-dialog form-surface__form" noValidate onSubmit={handleSubmit}>
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

        <Field id="place-type" label="نوع المكان">
          <select
            id="place-type"
            name="type"
            onChange={(event) => {
              setType(event.target.value as PlaceType);
              setSubtype("");
              setSubtypeError("");
              setFormError("");
              setCreatedPlace(null);
            }}
            value={type}
          >
            {createPlaceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {type === "restaurant" ? (
          <SubtypeField
            error={subtypeError}
            id="restaurant-subtype"
            label="نوع المطعم"
            onChange={setSubtype}
            options={restaurantSubtypeOptions}
            value={subtype}
          />
        ) : null}

        {type === "cafe" ? (
          <SubtypeField
            error={subtypeError}
            id="cafe-subtype"
            label="نوع المقهى"
            onChange={setSubtype}
            options={cafeSubtypeOptions}
            value={subtype}
          />
        ) : null}

        {createdPlace ? <StatusMessage tone="success">تم حفظ المكان.</StatusMessage> : null}
        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}

        <div className="form-surface__footer">
          <Button className="ds-button--full" isLoading={submitting} type="submit">
            حفظ
          </Button>
          <Button onClick={() => onClose(type)} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function SubtypeField({
  error,
  id,
  label,
  onChange,
  options,
  value
}: {
  error: string;
  id: string;
  label: string;
  onChange: (value: PlaceSubtype | "") => void;
  options: Array<{ label: string; value: PlaceSubtype }>;
  value: PlaceSubtype | "";
}) {
  return (
    <Field error={error} id={id} label={label}>
      <select
        aria-invalid={Boolean(error)}
        id={id}
        onChange={(event) => onChange(event.target.value as PlaceSubtype | "")}
        value={value}
      >
        <option value="">اختر</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
