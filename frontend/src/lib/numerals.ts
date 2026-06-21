const arabicIndicDigits = "٠١٢٣٤٥٦٧٨٩";
const easternArabicDigits = "۰۱۲۳۴۵۶۷۸۹";

export function toWesternDigits(value: string | number): string {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => String(arabicIndicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabicDigits.indexOf(digit)))
    .replace(/\u066B/g, ".")
    .replace(/\u066C/g, ",");
}

export function formatNumber(value: number): string {
  return toWesternDigits(
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      useGrouping: false
    }).format(value)
  );
}

export function formatRating(value: number): string {
  return toWesternDigits(Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1));
}

export function formatAverage(value: number | null): string {
  return value === null ? "لا تقييمات" : toWesternDigits(value.toFixed(1));
}

export function formatOutOfTen(value: number): string {
  return `${formatRating(value)}/10`;
}

export function listCountLabel(count: number): string {
  return `${formatNumber(count)} ${count === 1 ? "قائمة" : "قوائم"}`;
}

export function placeCountLabel(count: number): string {
  return `${formatNumber(count)} ${count === 1 ? "مكان" : "أماكن"}`;
}

export function ratingCountLabel(count: number): string {
  return `${formatNumber(count)} ${count === 1 ? "تقييم" : "تقييمات"}`;
}
