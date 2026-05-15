import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-7 lg:px-9 py-6 sm:py-8">
      {children}
    </main>
  );
}
