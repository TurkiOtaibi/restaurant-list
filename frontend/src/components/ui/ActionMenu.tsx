"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cx } from "@/lib/ui";

type ActionMenuItem = {
  destructive?: boolean;
  label: string;
  onSelect: () => void;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
  label: string;
  trigger?: ReactNode;
};

export function ActionMenu({ items, label, trigger }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const menuId = useId();
  const triggerId = useId();
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusItemOnOpenRef = useRef(false);
  const restoreFocusOnCloseRef = useRef(false);

  const focusItem = useCallback(
    (index: number) => {
      if (items.length === 0) {
        return;
      }

      const nextIndex = (index + items.length) % items.length;
      setActiveIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
    },
    [items.length]
  );

  const openMenu = useCallback(
    (index = 0) => {
      if (items.length === 0) {
        return;
      }

      const nextIndex = (index + items.length) % items.length;
      setActiveIndex(nextIndex);
      focusItemOnOpenRef.current = true;
      setOpen(true);
    },
    [items.length]
  );

  const closeMenu = useCallback((restoreFocus = true) => {
    focusItemOnOpenRef.current = false;
    restoreFocusOnCloseRef.current = restoreFocus;
    setOpen(false);
  }, []);

  useCloseOnOutsideClick(open, rootRef, closeMenu);

  useEffect(() => {
    if (!open) {
      if (restoreFocusOnCloseRef.current) {
        restoreFocusOnCloseRef.current = false;
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
      return;
    }

    if (focusItemOnOpenRef.current) {
      focusItemOnOpenRef.current = false;
      requestAnimationFrame(() => itemRefs.current[activeIndex]?.focus());
    }
  }, [activeIndex, open]);

  return (
    <div className="ds-action-menu" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="ds-action-menu__trigger"
        id={triggerId}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openMenu();
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(items.length - 1);
          } else if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
          }
        }}
        ref={triggerRef}
        type="button"
      >
        {trigger ?? <span aria-hidden="true">•••</span>}
      </button>
      {open ? (
        <div
          aria-labelledby={triggerId}
          className="ds-action-menu__items"
          id={menuId}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu();
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              focusItem(activeIndex + 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              focusItem(activeIndex - 1);
            } else if (event.key === "Home") {
              event.preventDefault();
              focusItem(0);
            } else if (event.key === "End") {
              event.preventDefault();
              focusItem(items.length - 1);
            } else if (event.key === "Tab") {
              closeMenu(false);
            }
          }}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              className={cx(item.destructive && "is-destructive")}
              key={item.label}
              onClick={() => {
                closeMenu(false);
                item.onSelect();
              }}
              onFocus={() => setActiveIndex(index)}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              role="menuitem"
              tabIndex={activeIndex === index ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function useCloseOnOutsideClick(
  open: boolean,
  rootRef: { current: HTMLDivElement | null },
  closeMenu: (restoreFocus?: boolean) => void
) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [closeMenu, open, rootRef]);
}
