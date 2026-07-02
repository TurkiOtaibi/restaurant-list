import type { UserList } from "@/lib/api";

export type ListVisibility = UserList["visibility"];

const LIST_VISIBILITY_LABELS: Record<ListVisibility, string> = {
  private: "خاصة",
  public: "عامة"
};

export const LIST_VISIBILITY_OPTIONS: Array<{
  label: string;
  value: ListVisibility;
}> = [
  {
    label: LIST_VISIBILITY_LABELS.private,
    value: "private"
  },
  {
    label: LIST_VISIBILITY_LABELS.public,
    value: "public"
  }
];

export function listVisibilityLabel(visibility: ListVisibility): string {
  return LIST_VISIBILITY_LABELS[visibility];
}
