"use client";

import type { CSSProperties } from "react";
import { useId } from "react";

import { formatOutOfTen } from "@/lib/numerals";
import { composeDescriptionIds, cx } from "@/lib/ui";

import { NumberText } from "./NumberText";

const RATING_MIN = 1;
const RATING_MAX = 10;
const RATING_STEP = 0.5;
const RATING_UNSET_LABEL = "لم تحدد تقييمًا";

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

function clampRating(value: number): number {
  const stepped = Math.round(value / RATING_STEP) * RATING_STEP;
  return Math.min(RATING_MAX, Math.max(RATING_MIN, stepped));
}

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
  const inputId = `${controlId}-input`;
  const consequenceId = consequenceMessage ? `${controlId}-consequence` : undefined;
  const validationId = error ? errorId ?? `${controlId}-error` : undefined;
  const describedBy = composeDescriptionIds(consequenceId, validationId);
  const currentValue = value ?? RATING_MIN;
  const progress = `${((currentValue - RATING_MIN) / (RATING_MAX - RATING_MIN)) * 100}%`;
  const canDecrease = value !== null && value > RATING_MIN;
  const canIncrease = value === null || value < RATING_MAX;

  const decrease = () => {
    if (value === null) {
      return;
    }
    onChange(clampRating(value - RATING_STEP));
  };

  const increase = () => {
    onChange(value === null ? RATING_MIN : clampRating(value + RATING_STEP));
  };

  return (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={Boolean(error)}
      className="ds-rating-control"
      id={controlId}
    >
      <legend>{label}</legend>
      <div
        aria-live="polite"
        className={cx(
          "ds-rating-control__value",
          value === null && "ds-rating-control__value--unset"
        )}
      >
        {value !== null ? <NumberText>{formatOutOfTen(value)}</NumberText> : RATING_UNSET_LABEL}
      </div>
      <label className="ds-rating-control__hint" htmlFor={inputId}>
        اسحب المؤشر أو استخدم زري الزيادة والنقصان لتحديد تقييمك.
      </label>
      <div
        className="ds-rating-control__adjust"
        style={{ "--rating-progress": progress } as CSSProperties}
      >
        <button
          aria-label="أنقص التقييم"
          className="ds-rating-control__step"
          disabled={!canDecrease}
          onClick={decrease}
          type="button"
        >
          −
        </button>
        <span className="ds-rating-control__slider">
          <input
            aria-label={label}
            aria-valuenow={currentValue}
            aria-valuetext={
              value === null ? RATING_UNSET_LABEL : `Rating, ${value.toFixed(1)} out of 10`
            }
            id={inputId}
            max={RATING_MAX}
            min={RATING_MIN}
            name={name}
            onChange={(event) => onChange(Number(event.target.value))}
            required={required}
            step={RATING_STEP}
            type="range"
            value={currentValue}
          />
          <span className="ds-rating-control__scale" aria-hidden="true">
            <span>
              <NumberText>{formatOutOfTen(RATING_MIN)}</NumberText>
            </span>
            <span>
              <NumberText>{formatOutOfTen(RATING_MAX)}</NumberText>
            </span>
          </span>
        </span>
        <button
          aria-label="زد التقييم"
          className="ds-rating-control__step"
          disabled={!canIncrease}
          onClick={increase}
          type="button"
        >
          +
        </button>
      </div>
      {consequenceMessage ? (
        <p className="muted" id={consequenceId}>
          {consequenceMessage}
        </p>
      ) : null}
      {error ? (
        <p className="ds-status ds-status--error" id={validationId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
