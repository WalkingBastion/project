export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
