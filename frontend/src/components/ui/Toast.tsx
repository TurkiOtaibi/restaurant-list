import type { ReactNode } from "react";

type ToastProps = {
  action?: ReactNode;
  children: ReactNode;
  tone?: "success" | "notice" | "error";
};

export function Toast({ action, children, tone = "success" }: ToastProps) {
  return (
    <div
      aria-live={tone === "error" ? "assertive" : "polite"}
      className="ds-toast"
      role={tone === "error" ? "alert" : "status"}
    >
      <div>{children}</div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
