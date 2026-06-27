import type { Place } from "@/lib/api";
import { cx } from "@/lib/ui";

import { CafeIcon, IceCreamIcon, RestaurantIcon } from "./Icon";

type PlaceTypeIconProps = {
  type: Place["type"];
  className?: string;
};

// Shared type glyph rendered in a bordered surface tile. Used wherever a place
// is shown (library cards, profile ratings, place detail, add-to-list dialog)
// so the whole app stays visually consistent.
export function PlaceTypeIcon({ type, className }: PlaceTypeIconProps) {
  const Icon = type === "cafe" ? CafeIcon : type === "ice_cream" ? IceCreamIcon : RestaurantIcon;
  return (
    <span className={cx("ds-type-icon", className)} aria-hidden="true">
      <Icon />
    </span>
  );
}
