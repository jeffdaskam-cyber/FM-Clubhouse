export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isStale(isoTimestamp: string, maxAgeMs: number): boolean {
  return Date.now() - new Date(isoTimestamp).getTime() > maxAgeMs;
}
