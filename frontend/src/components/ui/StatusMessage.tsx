import type { ReactNode } from "react";

import { cx } from "@/lib/ui";

type StatusTone = "error" | "notice" | "success";

type StatusMessageProps = {
  children: ReactNode;
  tone: StatusTone;
};

export function StatusMessage({ children, tone }: StatusMessageProps) {
  return (
    <p
      className={cx("ds-status", `ds-status--${tone}`)}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
