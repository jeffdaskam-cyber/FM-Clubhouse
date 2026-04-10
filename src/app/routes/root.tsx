import { Outlet } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { TournamentProvider } from '@/context/TournamentContext';
import { TeamClaimScreen } from '@/components/onboarding/TeamClaimScreen';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

function RootContent() {
  const { isUser, userProfile, profileLoading } = useAuth();

  // Non-admin user who hasn't claimed a team yet
  const showClaimScreen = isUser && !profileLoading && userProfile === null;

  // Still resolving whether the user has a profile — show a brief spinner
  // instead of flashing the claim screen before the profile loads
  const stillResolvingProfile = isUser && profileLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col">
        {stillResolvingProfile
          ? <div className="flex-1 flex items-center justify-center py-16"><Spinner /></div>
          : showClaimScreen
            ? <TeamClaimScreen />
            : <Outlet />
        }
      </div>
      <Footer />
    </div>
  );
}

export function RootLayout() {
  return (
    <TournamentProvider>
      <RootContent />
    </TournamentProvider>
  );
}
