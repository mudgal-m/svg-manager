export function EmptyState({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <button className="button primary" onClick={onAction}>{actionLabel}</button>
    </section>
  );
}
