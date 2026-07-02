import type { ReactNode } from "react";

import type { FeedbackTone } from "@/lib/ui";
import { cx, statusRoleForTone } from "@/lib/ui";

type StatusMessageProps = {
  children: ReactNode;
  tone: FeedbackTone;
};

export function StatusMessage({ children, tone }: StatusMessageProps) {
  return (
    <p className={cx("ds-status", `ds-status--${tone}`)} role={statusRoleForTone(tone)}>
      {children}
    </p>
  );
}
