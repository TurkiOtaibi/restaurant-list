"use client";

import type { InputHTMLAttributes } from "react";
import { useId } from "react";

import { Button } from "./Button";
import { ClearIcon } from "./Icon";

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  clearLabel?: string;
  label: string;
  onClear?: () => void;
  resultCount?: number;
  scopeLabel?: string;
};

export function SearchField({
  clearLabel = "مسح البحث",
  id,
  label,
  onClear,
  resultCount,
  scopeLabel = "بحث باسم المكان فقط.",
  value,
  ...props
}: SearchFieldProps) {
  const generatedId = useId();
  const searchId = id ?? `place-search-${generatedId}`;
  const scopeId = `${searchId}-scope`;
  const resultId = `${searchId}-results`;
  const describedBy =
    resultCount === undefined ? scopeId : `${scopeId} ${resultId}`;

  return (
    <div className="ds-search">
      <label htmlFor={searchId}>{label}</label>
      <div className="ds-search__control">
        <input
          aria-describedby={describedBy}
          id={searchId}
          role="searchbox"
          type="search"
          value={value}
          {...props}
        />
        {onClear ? (
          <Button aria-label={clearLabel} onClick={onClear} type="button" variant="icon">
            <ClearIcon />
          </Button>
        ) : null}
      </div>
      <p className="muted" id={scopeId}>
        {scopeLabel}
      </p>
      {resultCount !== undefined ? (
        <p className="muted" id={resultId} role="status">
          {resultCount === 1 ? "نتيجة واحدة" : `${resultCount} نتائج`}
        </p>
      ) : null}
    </div>
  );
}
