import { formatAverage } from "./numerals";

export function formatAverageRating(value: number | null): string {
  return formatAverage(value);
}
