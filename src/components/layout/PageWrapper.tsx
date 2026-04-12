import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {children}
    </main>
  );
}
