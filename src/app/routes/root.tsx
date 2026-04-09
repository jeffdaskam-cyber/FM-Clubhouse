import { Outlet } from 'react-router-dom';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { TournamentProvider } from '@/context/TournamentContext';

export function RootLayout() {
  return (
    <TournamentProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </TournamentProvider>
  );
}
