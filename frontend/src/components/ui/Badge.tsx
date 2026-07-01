import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/ui";

type BadgeVariant = "neutral" | "public" | "private" | "rating";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: BadgeVariant;
};

export function Badge({ children, className, icon, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span className={cx("ds-badge", badgeClass(variant), className)} {...props}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}

function badgeClass(variant: BadgeVariant): string {
  if (variant === "public") {
    return "ds-badge--public";
  }

  if (variant === "private") {
    return "ds-badge--private";
  }

  if (variant === "rating") {
    return "ds-badge--rating";
  }

  return "";
}
