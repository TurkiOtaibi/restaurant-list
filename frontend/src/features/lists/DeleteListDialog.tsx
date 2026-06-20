"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BidiText, BottomSheet, Button, Modal, StatusMessage } from "@/components/ui";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiError, ListDetail, apiRequest } from "@/lib/api";

type DeleteListDialogProps = {
  list: ListDetail;
  onClose: () => void;
  open: boolean;
};

export function DeleteListDialog({ list, onClose, open }: DeleteListDialogProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function deleteList() {
    setError("");
    setSubmitting(true);
    try {
      await apiRequest(`/lists/${list.id}`, { method: "DELETE" });
      router.replace("/lists");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذر الحذف.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      dialogRole="alertdialog"
      initialFocusSelector="#delete-list-cancel"
      labelledBy="delete-list-title"
      onClose={onClose}
      open={open}
      title="حذف القائمة"
    >
      <div className="confirm-dialog">
        <p>
          حذف <BidiText>{list.name}</BidiText>؟
        </p>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <div className="form-surface__footer">
          <Button
            className="ds-button--full"
            isLoading={submitting}
            onClick={() => void deleteList()}
            type="button"
            variant="destructive"
          >
            حذف
          </Button>
          <Button id="delete-list-cancel" onClick={onClose} type="button" variant="secondary">
            إلغاء
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
