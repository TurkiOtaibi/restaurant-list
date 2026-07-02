export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function composeDescriptionIds(
  ...ids: Array<string | false | null | undefined>
): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}
