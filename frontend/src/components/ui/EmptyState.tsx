import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  body?: string;
  title: string;
};

export function EmptyState({ action, body, title }: EmptyStateProps) {
  return (
    <section className="ds-empty" aria-live="polite">
      <h2 className="ds-empty__title">{title}</h2>
      {body ? <p className="muted">{body}</p> : null}
      {action ? <div>{action}</div> : null}
    </section>
  );
}
