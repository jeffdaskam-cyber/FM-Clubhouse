import { useQuery } from '@tanstack/react-query';
import { listTournaments } from '@/lib/firebase/tournaments';
import { Select } from '@/components/ui/Select';
import type { Tournament } from '@/types/tournament';

interface TournamentSelectorProps {
  value: string;
  onChange: (tournament: Tournament | null) => void;
}

export function TournamentSelector({ value, onChange }: TournamentSelectorProps) {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: listTournaments,
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = tournaments.find(t => t.id === e.target.value) ?? null;
    onChange(selected);
  };

  return (
    <Select
      label="Tournament"
      value={value}
      onChange={handleChange}
      disabled={isLoading}
    >
      <option value="">Select a tournament...</option>
      {tournaments.map(t => (
        <option key={t.id} value={t.id}>
          {t.name} {t.year}
        </option>
      ))}
    </Select>
  );
}
