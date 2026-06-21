import type { ReactNode } from "react";

import { cx } from "@/lib/ui";

type NumberTextProps = {
  children: ReactNode;
  className?: string;
};

export function NumberText({ children, className }: NumberTextProps) {
  return (
    <bdi className={cx("ds-number", className)} dir="ltr">
      {children}
    </bdi>
  );
}
