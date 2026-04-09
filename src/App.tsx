import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { RootLayout } from '@/app/routes/root';
import { Home } from '@/app/routes/home';
import { Leaderboard } from '@/app/routes/leaderboard';
import { Draft } from '@/app/routes/draft';
import { Settings } from '@/app/routes/settings';
import { Login } from '@/app/routes/login';
import { NotFound } from '@/app/routes/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'draft', element: <Draft /> },
      { path: 'settings', element: <Settings /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
