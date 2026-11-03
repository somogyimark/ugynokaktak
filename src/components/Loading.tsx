export function Loading({ label = 'Akták előkeresése…' }: { label?: string }) {
  return (
    <p role="status" className="mx-auto max-w-6xl px-4 py-16 text-center font-terminal text-sm text-[var(--desk-muted)]">
      {label}
    </p>
  );
}
