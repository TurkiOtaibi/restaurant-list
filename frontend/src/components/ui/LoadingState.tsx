"use client";

import { useEffect, useState } from "react";

import { cx } from "@/lib/ui";

type LoadingStateProps = {
  count?: number;
  delayMs?: number;
  label?: string;
  variant?: "card" | "text";
};

export function LoadingState({
  count = 3,
  delayMs = 300,
  label = "جاري التحميل",
  variant = "card"
}: LoadingStateProps) {
  const visible = useDelayedVisibility(delayMs);

  if (!visible) {
    return null;
  }

  return (
    <div aria-label={label} aria-live="polite" className="stack" role="status">
      {Array.from({ length: count }, (_, index) => (
        <div
          aria-hidden="true"
          className={cx("ds-skeleton", variant === "text" && "ds-skeleton--text")}
          key={index}
        />
      ))}
    </div>
  );
}

function useDelayedVisibility(delayMs: number) {
  const [visible, setVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return visible;
}
