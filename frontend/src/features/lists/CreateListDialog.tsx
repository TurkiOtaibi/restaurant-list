"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomSheet, Button, Modal, StatusMessage, TextInput } from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, UserList, apiRequest } from "@/lib/api";

import { VisibilitySelector } from "./VisibilitySelector";

type CreateListDialogProps = {
  onClose: () => void;
  open: boolean;
};

export function CreateListDialog({ onClose, open }: CreateListDialogProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<UserList["visibility"]>("private");
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasUnsavedChanges = Boolean(name.trim()) || visibility !== "private";

  function showNameRequired(shouldFocus = true) {
    setNameError("الاسم مطلوب.");
    if (shouldFocus) {
      nameRef.current?.focus();
    }
  }

  async function submitList() {
    setNameError("");
    setFormError("");

    if (!name.trim()) {
      showNameRequired();
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<UserList>("/lists", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() })
      });

      if (visibility === "public") {
        await apiRequest<UserList>(`/lists/${response.id}/visibility`, {
          method: "PATCH",
          body: JSON.stringify({ visibility })
        });
      }

      router.replace(`/lists/${response.id}`);
    } catch (caught) {
      setFormError(
        caught instanceof ApiError
          ? caught.message
          : "تعذر الحفظ. لم نفقد ما كتبته."
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
    <Dialog
      confirmCloseMessage="لديك قائمة لم تحفظ بعد. هل تريد الإغلاق؟"
      hasUnsavedChanges={hasUnsavedChanges && !submitting}
      initialFocusSelector="#list-name"
      labelledBy="create-list-title"
      onClose={onClose}
      open={open}
      title="أضف قائمة"
    >
      <form className="form-surface__form" noValidate onSubmit={handleSubmit}>
        <p className="muted">احفظ رفًا جديدًا للأماكن التي تريد تجربتها.</p>
        <TextInput
          error={nameError}
          id="list-name"
          label="اسم القائمة"
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
          }}
          ref={nameRef}
          value={name}
        />
        <VisibilitySelector
          name="list-visibility"
          onChange={setVisibility}
          value={visibility}
        />
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

              void submitList();
            }}
            type="button"
          >
            حفظ القائمة
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
