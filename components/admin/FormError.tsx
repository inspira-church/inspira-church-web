export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
      {message}
    </p>
  );
}
