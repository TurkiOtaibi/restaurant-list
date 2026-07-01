import type { Place } from "@/lib/api";
import { ratingCountLabel } from "@/lib/numerals";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";
import { cx } from "@/lib/ui";

import { BidiText } from "./BidiText";
import { Card, CardLink } from "./Card";
import { PlaceTypeIcon } from "./PlaceTypeIcon";
import { RatingDisplay } from "./RatingDisplay";

type PlaceCardProps = {
  compact?: boolean;
  href?: string;
  place: Pick<
    Place,
    | "averageRating"
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
      <div className="ds-place-card__main">
        <h2 className="ds-place-card__title">
          <BidiText>{place.name}</BidiText>
        </h2>
        <p className="ds-place-card__meta">
          <span>{placeTypeLabel(place.type)}</span>
          {subtype ? <span>{subtype}</span> : null}
        </p>
        {hasRating ? (
          <div className="ds-place-card__signals">
            <RatingDisplay
              ariaLabel={ratingCountLabel(place.ratingCount)}
              className="ds-place-card__score"
              value={place.averageRating ?? 0}
            />
          </div>
        ) : null}
      </div>
      <PlaceTypeIcon type={place.type} />
    </>
  );
}
