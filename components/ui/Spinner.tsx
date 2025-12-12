export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
