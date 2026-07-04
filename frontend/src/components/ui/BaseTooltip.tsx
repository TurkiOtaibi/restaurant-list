"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

type BaseTooltipProps = {
  children: ReactNode;
  label: string;
};

export function BaseTooltip({ children, label }: BaseTooltipProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger aria-label={label} className="ds-tooltip__trigger" type="button">
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner
            className="ds-tooltip__positioner"
            collisionAvoidance={{ align: "shift", fallbackAxisSide: "none", side: "shift" }}
            side="bottom"
            sideOffset={6}
          >
            <Tooltip.Popup className="ds-tooltip__popup" dir="rtl">
              <Tooltip.Arrow className="ds-tooltip__arrow" />
              {label}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
