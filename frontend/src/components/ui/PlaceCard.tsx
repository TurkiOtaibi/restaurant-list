import type { Place } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";
import { placeSubtypeLabel, placeTypeLabel } from "@/features/places/taxonomy";

import { Badge } from "./Badge";
import { BidiText } from "./BidiText";
import { Card, CardLink } from "./Card";

type PlaceCardProps = {
  href?: string;
  place: Place;
};

export function PlaceCard({ href, place }: PlaceCardProps) {
  const content = <PlaceCardContent place={place} />;

  if (href) {
    return (
      <CardLink className="ds-place-card" href={href}>
        {content}
      </CardLink>
    );
  }

  return (
    <Card className="ds-place-card">
      {content}
    </Card>
  );
}

function PlaceCardContent({ place }: { place: Place }) {
  const subtype = placeSubtypeLabel(place.subtype);

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
      </div>
      {place.averageRating !== null && place.ratingCount > 0 ? (
        <Badge variant="rating">
          {formatAverageRating(place.averageRating)} · {place.ratingCount} تقييم
        </Badge>
      ) : null}
    </>
  );
}
