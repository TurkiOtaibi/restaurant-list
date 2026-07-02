export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function composeDescriptionIds(
  ...ids: Array<string | false | null | undefined>
): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export type FeedbackTone = "error" | "notice" | "success";

export function statusRoleForTone(tone: FeedbackTone): "alert" | "status" {
  return tone === "error" ? "alert" : "status";
}

export function liveRegionForTone(tone: FeedbackTone): "assertive" | "polite" {
  return tone === "error" ? "assertive" : "polite";
}
