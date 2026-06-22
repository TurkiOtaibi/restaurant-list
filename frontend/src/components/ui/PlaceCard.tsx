import type { Place } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";
import { formatNumber, ratingCountLabel } from "@/lib/numerals";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";
import { cx } from "@/lib/ui";

import { BidiText } from "./BidiText";
import { Card, CardLink } from "./Card";
import { NumberText } from "./NumberText";
import { VisualArtwork } from "./VisualArtwork";

type PlaceCardProps = {
  compact?: boolean;
  href?: string;
  place: Place;
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

function PlaceCardContent({ place }: { place: Place }) {
  const subtype = placeSubtypeLabel(place.subtype);
  const hasRating = place.averageRating !== null && place.ratingCount > 0;

  return (
    <>
      <VisualArtwork id={place.id} label={place.name} type={place.type} variant="place" />
      <div className="ds-place-card__main">
        <h2 className="ds-place-card__title">
          <BidiText>{place.name}</BidiText>
        </h2>
        <p className="ds-place-card__meta">
          <span>{placeTypeLabel(place.type)}</span>
          {subtype ? <span>{subtype}</span> : null}
        </p>
      </div>
      {hasRating ? (
        <p className="ds-place-card__rating" aria-label={ratingCountLabel(place.ratingCount)}>
          <NumberText>{formatAverageRating(place.averageRating)}</NumberText>
          {place.ratingCount > 1 ? <NumberText>{formatNumber(place.ratingCount)}</NumberText> : null}
        </p>
      ) : null}
    </>
  );
}
