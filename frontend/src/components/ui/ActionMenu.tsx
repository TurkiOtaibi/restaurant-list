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
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setOpen(false), []);

  useCloseOnOutsideClick(open, rootRef, closeMenu);

  return (
    <div className="ds-action-menu" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="ds-action-menu__trigger"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        }}
        type="button"
      >
        {trigger ?? <span aria-hidden="true">•••</span>}
      </button>
      {open ? (
        <div className="ds-action-menu__items" id={menuId} role="menu">
          {items.map((item) => (
            <button
              className={cx(item.destructive && "is-destructive")}
              key={item.label}
              onClick={() => {
                closeMenu();
                item.onSelect();
              }}
              role="menuitem"
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
  closeMenu: () => void
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
