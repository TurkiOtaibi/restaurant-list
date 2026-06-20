import type { ReactNode } from "react";

import type { Place } from "@/lib/api";
import { formatAverageRating } from "@/lib/format";

import { Badge } from "./Badge";
import { BidiText } from "./BidiText";
import { Card } from "./Card";

type PlaceCardProps = {
  actions?: ReactNode;
  place: Place;
};

export function PlaceCard({ actions, place }: PlaceCardProps) {
  const ratingText = `${formatAverageRating(place.averageRating)} (${place.ratingCount})`;
  const typeLabel = place.type === "restaurant" ? "مطعم" : "مقهى";
  const triedLabel = "جربته";
  const accessibleName = `${place.name}، ${typeLabel}، متوسط التقييم ${ratingText}${
    place.currentUserTried ? `، ${triedLabel}` : ""
  }`;

  return (
    <Card aria-label={accessibleName} className="ds-place-card">
      <span className="ds-place-card__pin" aria-hidden="true" />
      <div className="ds-place-card__main">
        <h2 className="ds-place-card__title">
          <BidiText>{place.name}</BidiText>{" "}
          {place.currentUserTried ? <Badge>{triedLabel}</Badge> : null}
        </h2>
        <p className="ds-place-card__meta">
          <span className="ds-place-card__type">{typeLabel}</span>
          <Badge variant="rating">{ratingText}</Badge>
          {place.currentUserRating ? (
            <Badge variant="rating">تقييمك {place.currentUserRating}/10</Badge>
          ) : null}
        </p>
      </div>
      {place.description ? (
        <p className="ds-place-card__note">
          <BidiText>{place.description}</BidiText>
        </p>
      ) : null}
      {actions ? <div className="actions">{actions}</div> : null}
    </Card>
  );
}
