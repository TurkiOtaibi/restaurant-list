import type { ReactNode } from "react";

import { cx, statusRoleForTone } from "@/lib/ui";

type StatusTone = "error" | "notice" | "success";

type StatusMessageProps = {
  children: ReactNode;
  tone: StatusTone;
};

export function StatusMessage({ children, tone }: StatusMessageProps) {
  return (
    <p className={cx("ds-status", `ds-status--${tone}`)} role={statusRoleForTone(tone)}>
      {children}
    </p>
  );
}
