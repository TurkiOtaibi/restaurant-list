"use client";

import { useId } from "react";

type RatingControlProps = {
  consequenceMessage?: string;
  error?: string;
  errorId?: string;
  id?: string;
  label?: string;
  name: string;
  onChange: (value: number) => void;
  required?: boolean;
  value: number | null;
};

const ratingMeanings: Record<number, string> = {
  1: "ليس مناسبًا لي",
  2: "ليس مناسبًا لي",
  3: "ليس مناسبًا لي",
  4: "جيد",
  5: "جيد",
  6: "جيد",
  7: "أعجبني",
  8: "أعجبني",
  9: "مفضل",
  10: "مفضل"
};

export function RatingControl({
  consequenceMessage,
  error,
  errorId,
  id,
  label = "تقييمك",
  name,
  onChange,
  required = false,
  value
}: RatingControlProps) {
  const generatedId = useId();
  const controlId = id ?? `rating-${generatedId}`;
  const consequenceId = consequenceMessage ? `${controlId}-consequence` : undefined;
  const validationId = error ? errorId ?? `${controlId}-error` : undefined;
  const describedBy = [consequenceId, validationId].filter(Boolean).join(" ");

  return (
    <fieldset
      aria-describedby={describedBy || undefined}
      aria-invalid={Boolean(error)}
      className="ds-rating-control"
      id={controlId}
      tabIndex={-1}
    >
      <legend>{label}</legend>
      {consequenceMessage ? (
        <p className="muted" id={consequenceId}>
          {consequenceMessage}
        </p>
      ) : null}
      <div className="ds-rating-control__grid" role="radiogroup">
        {Array.from({ length: 10 }, (_, index) => {
          const rating = index + 1;
          return (
            <label className="ds-rating-control__option" key={rating}>
              <input
                checked={value === rating}
                name={name}
                onChange={() => onChange(rating)}
                required={required}
                type="radio"
                value={rating}
              />
              <span>{rating}</span>
              <span className="sr-only">
                {rating} من 10، {ratingMeanings[rating]}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="ds-status ds-status--error" id={validationId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
