"use client";

import { createPortal } from "react-dom";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { Button } from "./Button";
import { CloseIcon } from "./Icon";

type DialogProps = {
  children: ReactNode;
  closeLabel?: string;
  confirmCloseMessage?: string;
  dialogRole?: "dialog" | "alertdialog";
  hasUnsavedChanges?: boolean;
  initialFocusSelector?: string;
  labelledBy: string;
  onClose: () => void;
  onRequestClose?: () => void;
  open: boolean;
  title: string;
};

export function Modal(props: DialogProps) {
  return <DialogSurface className="ds-modal" props={props} />;
}

export function BottomSheet(props: DialogProps) {
  return <DialogSurface className="ds-bottom-sheet" props={props} showGrabber />;
}

function DialogSurface({
  className,
  props,
  showGrabber = false
}: {
  className: string;
  props: DialogProps;
  showGrabber?: boolean;
}) {
  const layer = useDialogLayer(props.open);
  const ref = useDialogBehavior(props.open, layer?.root ?? null, props.initialFocusSelector);
  const { cancelClose, close, confirmingClose, confirmClose } = useConfirmableClose(props);
  useDocumentEscape(props.open, close);
  useFocusAfterConfirmClose(props.open, ref, confirmingClose, props.initialFocusSelector);

  if (!props.open || !layer) {
    return null;
  }

  return createPortal(
    <>
      <div className="ds-dialog-backdrop" />
      <section
        aria-labelledby={props.labelledBy}
        aria-modal="true"
        className={className}
        onKeyDown={(event) => handleDialogKeyDown(event, close)}
        ref={ref}
        role={props.dialogRole ?? "dialog"}
        tabIndex={-1}
      >
        {showGrabber ? <span className="ds-bottom-sheet__grabber" aria-hidden="true" /> : null}
        <DialogHeader {...props} onRequestClose={close} />
        {confirmingClose ? (
          <ConfirmCloseNotice
            message={props.confirmCloseMessage}
            onCancel={cancelClose}
            onConfirm={confirmClose}
          />
        ) : null}
        {props.children}
      </section>
    </>,
    layer.root
  );
}

export function ResponsiveDialog(props: DialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Dialog = isDesktop ? Modal : BottomSheet;

  return <Dialog {...props} />;
}

function DialogHeader({
  closeLabel = "إغلاق",
  labelledBy,
  onClose,
  onRequestClose,
  title
}: DialogProps) {
  return (
    <div className="ds-dialog__header">
      <h2 id={labelledBy}>{title}</h2>
      <Button
        aria-label={closeLabel}
        className="ds-dialog__close"
        onClick={onRequestClose ?? onClose}
        type="button"
        variant="icon"
      >
        <CloseIcon />
      </Button>
    </div>
  );
}

function useDialogLayer(open: boolean) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const element = document.createElement("div");
    element.dataset.dsDialogRoot = "true";
    document.body.appendChild(element);
    setRoot(element);

    return () => {
      setRoot(null);
      element.remove();
    };
  }, [open]);

  return root ? { root } : null;
}

function useDialogBehavior(
  open: boolean,
  portalRoot: HTMLElement | null,
  initialFocusSelector?: string
) {
  const ref = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || !portalRoot) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siblings = Array.from(document.body.children).filter((child) => child !== portalRoot);
    const previousStates = siblings.map((child) => ({
      element: child as HTMLElement & { inert?: boolean },
      inert: (child as HTMLElement & { inert?: boolean }).inert,
      ariaHidden: child.getAttribute("aria-hidden")
    }));
    const previousBodyOverflowY = document.body.style.overflowY;

    previousStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    document.body.style.overflowY = "hidden";
    const initialFocus =
      initialFocusSelector && ref.current
        ? ref.current.querySelector<HTMLElement>(initialFocusSelector)
        : null;
    const firstFocusable = ref.current ? getFocusableElements(ref.current)[0] : null;
    (initialFocus ?? firstFocusable ?? ref.current)?.focus();

    return () => {
      previousStates.forEach(({ ariaHidden, element, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });
      document.body.style.overflowY = previousBodyOverflowY;
      previousFocusRef.current?.focus();
    };
  }, [initialFocusSelector, open, portalRoot]);

  return ref;
}

function useConfirmableClose({
  hasUnsavedChanges = false,
  onClose,
  open
}: DialogProps) {
  const [confirmingClose, setConfirmingClose] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmingClose(false);
    }
  }, [open]);

  function close() {
    if (hasUnsavedChanges) {
      setConfirmingClose(true);
      return;
    }

    onClose();
  }

  function confirmClose() {
    setConfirmingClose(false);
    onClose();
  }

  function cancelClose() {
    setConfirmingClose(false);
  }

  return {
    cancelClose,
    close,
    confirmingClose,
    confirmClose
  };
}

function useDocumentEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);
}

function useFocusAfterConfirmClose(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  confirmingClose: boolean,
  initialFocusSelector?: string
) {
  useEffect(() => {
    if (!open || confirmingClose || !ref.current) {
      return;
    }

    if (ref.current.contains(document.activeElement)) {
      return;
    }

    const initialFocus = initialFocusSelector
      ? ref.current.querySelector<HTMLElement>(initialFocusSelector)
      : null;
    const firstFocusable = getFocusableElements(ref.current)[0];
    (initialFocus ?? firstFocusable ?? ref.current).focus();
  }, [confirmingClose, initialFocusSelector, open, ref]);
}

function ConfirmCloseNotice({
  message = "لديك تغييرات غير محفوظة. هل تريد إغلاق النافذة؟",
  onCancel,
  onConfirm
}: {
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div aria-live="assertive" className="ds-dialog-confirm" role="alert">
      <p>{message}</p>
      <div className="actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          متابعة التحرير
        </Button>
        <Button onClick={onConfirm} type="button">
          تجاهل وإغلاق
        </Button>
      </div>
    </div>
  );
}

function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>, onClose: () => void) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    onClose();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(event.currentTarget);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}
