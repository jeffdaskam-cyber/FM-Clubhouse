import { createContext, useContext, useState, type ReactNode } from 'react';

interface TournamentContextValue {
  activeTournamentId: string | null;
  setActiveTournamentId: (id: string | null) => void;
}

const TournamentContext = createContext<TournamentContextValue>({
  activeTournamentId: null,
  setActiveTournamentId: () => {},
});

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

  return (
    <TournamentContext.Provider value={{ activeTournamentId, setActiveTournamentId }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournamentContext() {
  return useContext(TournamentContext);
}
