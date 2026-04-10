import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/lib/firebase/userProfiles';
import type { UserProfile } from '@/types/fantasy';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  userProfile: UserProfile | null;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  isUser: false,
  userProfile: null,
  profileLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
      if (!u) {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });
    return unsub;
  }, []);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  const isAdmin =
    !loading &&
    user !== null &&
    !!adminEmail &&
    user.email?.toLowerCase() === adminEmail.toLowerCase();
  const isUser = !loading && user !== null && !isAdmin;

  // Load Firestore profile for non-admin users only
  useEffect(() => {
    if (!isUser || !user) return;
    let cancelled = false;
    setProfileLoading(true);
    getUserProfile(user.uid)
      .then(profile => {
        if (!cancelled) {
          setUserProfile(profile);
          setProfileLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, [isUser, user]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isUser, userProfile, profileLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
