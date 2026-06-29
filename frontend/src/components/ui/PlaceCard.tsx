import type { Place } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";
import { ratingCountLabel } from "@/lib/numerals";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";
import { cx } from "@/lib/ui";

import { BidiText } from "./BidiText";
import { Card, CardLink } from "./Card";
import { CheckIcon } from "./Icon";
import { NumberText } from "./NumberText";
import { PlaceTypeIcon } from "./PlaceTypeIcon";

type PlaceCardProps = {
  compact?: boolean;
  href?: string;
  place: Pick<
    Place,
    | "averageRating"
    | "currentUserTried"
    | "id"
    | "name"
    | "ratingCount"
    | "subtype"
    | "type"
  >;
  view?: "card" | "row";
};

export function PlaceCard({ compact = false, href, place, view = "card" }: PlaceCardProps) {
  const content = <PlaceCardContent place={place} />;
  const className = cx(
    "ds-place-card",
    view === "row" && "ds-place-card--row",
    compact && "ds-place-card--compact"
  );

  if (href) {
    return (
      <CardLink className={className} href={href}>
        {content}
      </CardLink>
    );
  }

  return <Card className={className}>{content}</Card>;
}

function PlaceCardContent({ place }: { place: PlaceCardProps["place"] }) {
  const subtype = placeSubtypeLabel(place.subtype);
  const hasRating = place.averageRating !== null && place.ratingCount > 0;

  return (
    <>
      <PlaceTypeIcon type={place.type} />
      <div className="ds-place-card__main">
        <h2 className="ds-place-card__title">
          <BidiText>{place.name}</BidiText>
        </h2>
        <p className="ds-place-card__meta">
          {hasRating ? (
            <span className="ds-place-card__score" aria-label={ratingCountLabel(place.ratingCount)}>
              <NumberText>{formatAverageRating(place.averageRating)}</NumberText>
            </span>
          ) : null}
          {place.currentUserTried ? (
            <span className="ds-place-card__tried">
              <CheckIcon aria-hidden="true" />
              <span>جربته</span>
            </span>
          ) : null}
          <span>{placeTypeLabel(place.type)}</span>
          {subtype ? <span>{subtype}</span> : null}
        </p>
      </div>
    </>
  );
}
