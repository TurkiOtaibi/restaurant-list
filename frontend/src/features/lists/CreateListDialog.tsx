"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Button, ResponsiveDialog, StatusMessage, TextInput } from "@/components/ui";
import { ApiError, UserList, apiRequest } from "@/lib/api";

import { VisibilitySelector } from "./VisibilitySelector";

type CreateListDialogProps = {
  onClose: () => void;
  open: boolean;
};

export function CreateListDialog({ onClose, open }: CreateListDialogProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<UserList["visibility"]>("private");
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasUnsavedChanges = Boolean(name.trim()) || visibility !== "private";

  useEffect(() => {
    if (open) {
      setNameError("");
      setFormError("");
      setSubmitted(false);
    }
  }, [open]);

  function currentName() {
    return (nameRef.current?.value ?? name).trim();
  }

  function showNameRequired(shouldFocus = true) {
    setNameError("اسم القائمة مطلوب");
    if (shouldFocus) {
      nameRef.current?.focus();
    }
  }

  async function submitList() {
    setSubmitted(true);
    setNameError("");
    setFormError("");

    const trimmedName = currentName();

    if (!trimmedName) {
      showNameRequired();
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<UserList>("/lists", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, visibility })
      });

      window.location.href = `/lists/${response.id}`;
    } catch (caught) {
      setFormError(
        caught instanceof ApiError
          ? caught.message
          : "تعذر الحفظ."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitList();
  }

  return (
    <ResponsiveDialog
      confirmCloseMessage="هناك تغييرات غير محفوظة. إغلاق؟"
      desktopPresentation="base-ui"
      hasUnsavedChanges={hasUnsavedChanges && !submitting}
      initialFocusSelector="#list-name"
      labelledBy="create-list-title"
      onClose={onClose}
      open={open}
      title="أضف قائمة"
    >
      <form className="form-surface__form" noValidate onSubmit={handleSubmit}>
        <TextInput
          error={nameError}
          id="list-name"
          label="اسم القائمة"
          name="name"
          onChange={(event) => {
            const nextName = event.target.value;
            setName(nextName);
            if (submitted && !nextName.trim()) {
              showNameRequired(false);
            } else {
              setNameError("");
            }
            setFormError("");
          }}
          ref={nameRef}
          value={name}
        />
        <VisibilitySelector name="list-visibility" onChange={setVisibility} value={visibility} />
        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
        <div className="form-surface__footer">
          <Button
            className="ds-button--full"
            isLoading={submitting}
            type="submit"
          >
            حفظ
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
