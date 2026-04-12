import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-5xl mx-auto px-3 py-6">
      {children}
    </main>
  );
}
