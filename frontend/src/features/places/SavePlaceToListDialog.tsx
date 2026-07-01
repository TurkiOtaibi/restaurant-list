"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  BidiText,
  Button,
  EmptyState,
  LoadingState,
  ResponsiveDialog,
  StatusMessage
} from "@/components/ui";
import { ApiError, Place, UserList, apiCollection, apiRequest } from "@/lib/api";
import { placeCountLabel } from "@/lib/numerals";

type SavePlaceToListDialogProps = {
  onClose: () => void;
  onSaved: (place: Place) => void;
  open: boolean;
  place: Place;
};

export function SavePlaceToListDialog({
  onClose,
  onSaved,
  open,
  place
}: SavePlaceToListDialogProps) {
  const [lists, setLists] = useState<UserList[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [savingListId, setSavingListId] = useState<string | null>(null);
  const [savedListIds, setSavedListIds] = useState(place.currentUserListIds);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;
    setLoadingLists(true);
    setError("");

    apiCollection<UserList>("/lists")
      .then((response) => {
        if (isMounted) {
          setLists(response.data);
        }
      })
      .catch((caught) => {
        if (isMounted) {
          setError(caught instanceof ApiError ? caught.message : "تعذر تحميل القوائم.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingLists(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  async function saveToList(list: UserList) {
    setMessage("");
    setError("");
    setSavingListId(list.id);
    try {
      await apiRequest(`/lists/${list.id}/items`, {
        method: "POST",
        body: JSON.stringify({ placeId: place.id })
      });
      const updatedPlace = await apiRequest<Place>(`/places/${place.id}`);
      onSaved(updatedPlace);
      setSavedListIds(updatedPlace.currentUserListIds);
      setMessage("تمت الإضافة.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تعذرت الإضافة.");
    } finally {
      setSavingListId(null);
    }
  }

  return (
    <ResponsiveDialog
      initialFocusSelector="#save-place-list-options"
      labelledBy="save-place-title"
      onClose={onClose}
      open={open}
      title="أضف إلى قائمة"
    >
      <div className="place-save-dialog">
        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {loadingLists ? <LoadingState count={2} delayMs={0} label="جاري تحميل القوائم" /> : null}
        {!loadingLists && lists.length === 0 ? (
          <EmptyState
            action={<Link href="/lists/new">أنشئ قائمة</Link>}
            body="لا توجد قوائم."
            title="لا توجد قوائم"
          />
        ) : null}
        {!loadingLists && lists.length > 0 ? (
          <div className="place-save-dialog__lists" id="save-place-list-options" tabIndex={-1}>
            {lists.map((list) => {
              const isSavedHere = savedListIds.includes(list.id);
              return (
                <article className="place-save-dialog__list" key={list.id}>
                  <div>
                    <h3>
                      <BidiText>{list.name}</BidiText>
                    </h3>
                    <p className="muted">{placeCountLabel(list.placeCount)}</p>
                  </div>
                  <Button
                    className="place-save-dialog__add-button"
                    disabled={isSavedHere}
                    isLoading={savingListId === list.id}
                    onClick={() => void saveToList(list)}
                    type="button"
                    variant={isSavedHere ? "secondary" : "primary"}
                  >
                    {isSavedHere ? "موجود" : "أضف"}
                  </Button>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </ResponsiveDialog>
  );
}
