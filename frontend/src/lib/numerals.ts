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

type ArabicNounForms = {
  one: string;
  two: string;
  few: string;
  many: string;
};

// Arabic counted-noun agreement (CLDR-aligned): 1 singular, 2 dual, 3–10 plural,
// 11+ singular accusative. The digit is shown only when it is not already implied
// by the dual/singular wording, matching natural Arabic.
function arabicCount(count: number, forms: ArabicNounForms): string {
  const n = Math.abs(count);
  if (n === 1) {
    return forms.one;
  }
  if (n === 2) {
    return forms.two;
  }
  const mod100 = n % 100;
  const form = mod100 >= 3 && mod100 <= 10 ? forms.few : forms.many;
  return `${formatNumber(count)} ${form}`;
}

export function listCountLabel(count: number): string {
  return arabicCount(count, {
    one: "قائمة واحدة",
    two: "قائمتان",
    few: "قوائم",
    many: "قائمة"
  });
}

export function placeCountLabel(count: number): string {
  return arabicCount(count, {
    one: "مكان واحد",
    two: "مكانان",
    few: "أماكن",
    many: "مكانًا"
  });
}

export function ratingCountLabel(count: number): string {
  return arabicCount(count, {
    one: "تقييم واحد",
    two: "تقييمان",
    few: "تقييمات",
    many: "تقييمًا"
  });
}
