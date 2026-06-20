"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { BottomSheet, Button, Modal, StatusMessage, TextInput } from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, ListDetail, UserList, apiRequest } from "@/lib/api";

import { VisibilitySelector } from "./VisibilitySelector";

type EditListDialogProps = {
  list: ListDetail;
  onClose: () => void;
  onUpdated: (list: ListDetail) => void;
  open: boolean;
};

export function EditListDialog({ list, onClose, onUpdated, open }: EditListDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(list.name);
  const [visibility, setVisibility] = useState<UserList["visibility"]>(list.visibility);
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const trimmedName = name.trim();
  const hasUnsavedChanges = trimmedName !== list.name || visibility !== list.visibility;

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(list.name);
    setVisibility(list.visibility);
    setNameError("");
    setFormError("");
  }, [list.name, list.visibility, open]);

  function showNameRequired(shouldFocus = true) {
    setNameError("الاسم مطلوب.");
    if (shouldFocus) {
      nameRef.current?.focus();
    }
  }

  async function submitList() {
    setNameError("");
    setFormError("");

    if (!trimmedName) {
      showNameRequired();
      return;
    }

    setSubmitting(true);
    try {
      let nextList = list;

      if (trimmedName !== list.name) {
        const renamed = await apiRequest<UserList>(`/lists/${list.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: trimmedName })
        });
        nextList = { ...nextList, name: renamed.name, updatedAt: renamed.updatedAt };
      }

      if (visibility !== list.visibility) {
        const updatedVisibility = await apiRequest<UserList>(`/lists/${list.id}/visibility`, {
          method: "PATCH",
          body: JSON.stringify({ visibility })
        });
        nextList = {
          ...nextList,
          updatedAt: updatedVisibility.updatedAt,
          visibility: updatedVisibility.visibility
        };
      }

      onUpdated(nextList);
      onClose();
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "تعذر الحفظ.");
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
      confirmCloseMessage="هناك تغييرات غير محفوظة. إغلاق؟"
      hasUnsavedChanges={hasUnsavedChanges && !submitting}
      initialFocusSelector="#edit-list-name"
      labelledBy="edit-list-title"
      onClose={onClose}
      open={open}
      title="تعديل القائمة"
    >
      <form className="form-surface__form" noValidate onSubmit={handleSubmit}>
        <TextInput
          error={nameError}
          id="edit-list-name"
          label="اسم القائمة"
          name="name"
          onBlur={() => {
            if (!trimmedName) {
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
        <VisibilitySelector name="edit-list-visibility" onChange={setVisibility} value={visibility} />
        {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
        <div className="form-surface__footer">
          <Button className="ds-button--full" isLoading={submitting} type="submit">
            حفظ
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
