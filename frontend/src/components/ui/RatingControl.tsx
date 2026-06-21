"use client";

import { useId } from "react";

import { formatOutOfTen } from "@/lib/numerals";

import { NumberText } from "./NumberText";

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
  const describedBy = [consequenceId, validationId].filter(Boolean).join(" ");
  const currentValue = value ?? 1;

  return (
    <fieldset
      aria-describedby={describedBy || undefined}
      aria-invalid={Boolean(error)}
      className="ds-rating-control"
      id={controlId}
    >
      <legend>{label}</legend>
      <div className="ds-rating-control__value" aria-live="polite">
        <NumberText>{value ? formatOutOfTen(value) : "—/10"}</NumberText>
      </div>
      <label className="ds-rating-control__stars" htmlFor={inputId}>
        <input
          aria-label={label}
          aria-valuetext={`${currentValue} من 10`}
          id={inputId}
          max={10}
          min={1}
          name={name}
          onChange={(event) => onChange(Number(event.target.value))}
          required={required}
          step={0.5}
          type="range"
          value={currentValue}
        />
        <span className="ds-rating-control__star-row" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => {
            const starValue = index + 1;
            const state =
              value !== null && value >= starValue
                ? "full"
                : value !== null && value >= starValue - 0.5
                  ? "half"
                  : "empty";

            return (
              <span className={`ds-rating-control__star is-${state}`} key={starValue}>
                ★
              </span>
            );
          })}
        </span>
      </label>
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
