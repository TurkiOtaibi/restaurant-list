import type { ReactNode } from "react";

import { cx } from "@/lib/ui";

type BidiTextProps = {
  children: ReactNode;
  className?: string;
};

export function BidiText({ children, className }: BidiTextProps) {
  return (
    <bdi className={cx("ds-bidi", className)} dir="auto">
      {children}
    </bdi>
  );
}
