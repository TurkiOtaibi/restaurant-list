export function formatAverageRating(value: number | null): string {
  return value === null ? "لا تقييمات" : value.toFixed(1);
}
