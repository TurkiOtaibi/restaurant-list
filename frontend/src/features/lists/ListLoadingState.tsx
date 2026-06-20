type ListLoadingStateProps = {
  count?: number;
  includeHeader?: boolean;
  label: string;
};

export function ListLoadingState({ count = 3, includeHeader = false, label }: ListLoadingStateProps) {
  return (
    <section aria-label={label} aria-live="polite" className="list-skeletons" role="status">
      {includeHeader ? (
        <div aria-hidden="true" className="list-skeletons__header">
          <span />
          <span />
        </div>
      ) : null}
      {Array.from({ length: count }, (_, index) => (
        <article aria-hidden="true" className="list-skeleton-card" key={index}>
          <span />
          <span />
        </article>
      ))}
    </section>
  );
}
