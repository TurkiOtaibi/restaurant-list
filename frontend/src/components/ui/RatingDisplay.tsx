import { formatAverageRating } from "@/lib/format";
import { formatOutOfTen } from "@/lib/numerals";
import { cx } from "@/lib/ui";

import { NumberText } from "./NumberText";

type RatingDisplayVariant = "average" | "outOfTen";

const RATING_FORMATTERS: Record<RatingDisplayVariant, (value: number) => string> = {
  average: formatAverageRating,
  outOfTen: formatOutOfTen
};

type RatingDisplayProps = {
  ariaLabel?: string;
  className?: string;
  label?: string;
  suffix?: string;
  value: number;
  variant?: RatingDisplayVariant;
};

export function RatingDisplay({
  ariaLabel,
  className,
  label,
  suffix,
  value,
  variant = "average"
}: RatingDisplayProps) {
  const formatted = RATING_FORMATTERS[variant](value);

  return (
    <span aria-label={ariaLabel} className={cx("ds-rating-display", className)}>
      {label ? <span className="ds-rating-display__label">{label} </span> : null}
      <NumberText>{formatted}</NumberText>
      {suffix ? <span className="ds-rating-display__suffix"> {suffix}</span> : null}
    </span>
  );
}
