import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/ui";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Chip({ children, className, ...props }: ChipProps) {
  return (
    <span className={cx("ds-chip", className)} {...props}>
      {children}
    </span>
  );
}
