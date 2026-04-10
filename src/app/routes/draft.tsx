import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTournaments } from '@/lib/firebase/tournaments';
import { TournamentSelector } from '@/components/draft/TournamentSelector';
import { DraftForm } from '@/components/draft/DraftForm';
import { Spinner } from '@/components/ui/Spinner';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import type { Tournament } from '@/types/tournament';

export function Draft() {
  const { isAdmin, loading } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Pre-warm the tournaments query (used by TournamentSelector)
  useQuery({ queryKey: ['tournaments'], queryFn: listTournaments });

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner className="text-golf-green w-8 h-8" /></div>;
  }

  if (!isAdmin) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-3">You must be signed in as an admin to access the draft.</p>
          <Link to="/login" className="text-golf-green underline hover:text-fairway text-sm">
            Sign in
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Draft</h1>

      <div className="space-y-6">
        <TournamentSelector
          value={selectedTournament?.id ?? ''}
          onChange={setSelectedTournament}
        />

        {selectedTournament && (
          <DraftForm
            tournament={selectedTournament}
            isLocked={selectedTournament.isLocked}
          />
        )}
      </div>
    </PageWrapper>
  );
}
