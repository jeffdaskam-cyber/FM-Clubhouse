import { useState, useEffect } from 'react';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase/config';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

const EMAIL_KEY = 'fmc_signin_email';

type Step = 'input' | 'sent' | 'confirm' | 'completing';

export function Login() {
  const [step, setStep] = useState<Step>('input');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already signed in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // On mount: check if this URL is a magic link callback
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const saved = localStorage.getItem(EMAIL_KEY);
    if (saved) {
      // Same device — complete automatically
      setStep('completing');
      signInWithEmailLink(auth, saved, window.location.href)
        .then(() => {
          localStorage.removeItem(EMAIL_KEY);
          // navigation happens via the user useEffect above
        })
        .catch(() => {
          setError('Sign-in link expired or already used. Please request a new one.');
          setStep('input');
        });
    } else {
      // Different device — ask for email confirmation
      setStep('confirm');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setWorking(true);
    setError('');
    try {
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      localStorage.setItem(EMAIL_KEY, email.trim());
      setStep('sent');
    } catch {
      setError('Could not send sign-in link. Check the email address and try again.');
    } finally {
      setWorking(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setWorking(true);
    setError('');
    try {
      await signInWithEmailLink(auth, email.trim(), window.location.href);
      localStorage.removeItem(EMAIL_KEY);
      // navigation happens via the user useEffect above
    } catch {
      setError('Sign-in failed. Make sure you entered the correct email address.');
    } finally {
      setWorking(false);
    }
  }

  if (step === 'completing') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center space-y-3">
          <div className="text-4xl">✉️</div>
          <p className="text-xl font-bold text-neutral-900">Check your email</p>
          <p className="text-sm text-neutral-500">
            We sent a sign-in link to{' '}
            <span className="font-medium text-neutral-700">{email}</span>.
            Click the link in your email to sign in — no password needed.
          </p>
          <Button variant="ghost" size="sm" onClick={() => { setStep('input'); setEmail(''); }}>
            Use a different email
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Confirm your email</h1>
          <p className="text-sm text-neutral-500 mb-4">
            Enter the email address you used to request the sign-in link to complete sign-in.
          </p>
          <form onSubmit={handleConfirm} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={working} className="w-full">
              {working ? 'Signing in…' : 'Complete Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Default: step === 'input'
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <img src="/icons/Logo_192.png" alt="FM Clubhouse" className="w-14 h-14 rounded-lg object-contain" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-1 text-center">Sign in to FM Clubhouse</h1>
        <p className="text-sm text-neutral-500 mb-5 text-center">
          Enter your email and we'll send you a sign-in link — no password needed.
        </p>
        <form onSubmit={handleSendLink} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={working} className="w-full">
            {working ? 'Sending…' : 'Send sign-in link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
