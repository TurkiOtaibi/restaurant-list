import type { ReactNode } from "react";

import type { FeedbackTone } from "@/lib/ui";
import { liveRegionForTone, statusRoleForTone } from "@/lib/ui";

type ToastProps = {
  action?: ReactNode;
  children: ReactNode;
  tone?: FeedbackTone;
};

export function Toast({ action, children, tone = "success" }: ToastProps) {
  return (
    <div
      aria-live={liveRegionForTone(tone)}
      className="ds-toast"
      role={statusRoleForTone(tone)}
    >
      <div>{children}</div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
