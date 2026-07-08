"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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

type ActionMenuPosition = {
  left: number;
  top: number;
};

const MENU_VIEWPORT_MARGIN = 12;
const MENU_TRIGGER_GAP = 8;

export function ActionMenu({ items, label, trigger }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<ActionMenuPosition | null>(null);
  const menuId = useId();
  const triggerId = useId();
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuRef = useRef<HTMLDivElement>(null);
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

  const updateMenuPosition = useCallback(() => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();

    if (!triggerRect || !menuRect) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxMenuWidth = Math.max(0, viewportWidth - MENU_VIEWPORT_MARGIN * 2);
    const menuWidth = Math.min(menuRect.width, maxMenuWidth);
    const maxLeft = Math.max(MENU_VIEWPORT_MARGIN, viewportWidth - MENU_VIEWPORT_MARGIN - menuWidth);
    const preferredLeft = triggerRect.right - menuWidth;
    const left = Math.min(Math.max(preferredLeft, MENU_VIEWPORT_MARGIN), maxLeft);

    const maxTop = Math.max(MENU_VIEWPORT_MARGIN, viewportHeight - MENU_VIEWPORT_MARGIN - menuRect.height);
    const preferredTop = triggerRect.bottom + MENU_TRIGGER_GAP;
    const top = Math.min(Math.max(preferredTop, MENU_VIEWPORT_MARGIN), maxTop);

    setMenuPosition((currentPosition) => {
      if (currentPosition?.left === left && currentPosition.top === top) {
        return currentPosition;
      }

      return { left, top };
    });
  }, []);

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

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    const frame = requestAnimationFrame(updateMenuPosition);

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

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

  const menuStyle: CSSProperties = {
    left: menuPosition?.left ?? 0,
    top: menuPosition?.top ?? 0,
    visibility: menuPosition ? "visible" : "hidden"
  };

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
          ref={menuRef}
          role="menu"
          style={menuStyle}
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
