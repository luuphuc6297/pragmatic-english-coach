import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { styles } from '../../configs/themeConfig';

interface AuthProps {
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      email: 'guest@example.com',
      user_metadata: { name: 'Guest User' }
    };
    localStorage.setItem('pragmatic_user', JSON.stringify(guestUser));
    onSuccess();
    // Force reload to apply guest user
    window.location.reload();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'Failed to fetch') {
        console.warn('Supabase is offline. Falling back to guest mode.');
        alert('The database appears to be offline or unreachable. You will be logged in as a guest to continue using the app.');
        handleGuestLogin();
      } else {
        setError(message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        const authWindow = window.open(
          data.url,
          'oauth_popup',
          'width=600,height=700'
        );

        if (!authWindow) {
          setError('Please allow popups for this site to connect your account.');
          setGoogleLoading(false);
        } else {
          const checkPopup = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkPopup);
              setGoogleLoading(false);
            }
          }, 1000);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'Failed to fetch') {
        console.warn('Supabase is offline. Falling back to guest mode.');
        alert('The database appears to be offline or unreachable. You will be logged in as a guest to continue using the app.');
        handleGuestLogin();
      } else {
        setError(message || 'An error occurred during Google authentication.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`${styles.layout.screenDark} relative`}>
      {/* Background Decor */}
      <div className={styles.layout.gradientBg} />

      <div className="max-w-md w-full z-10 p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-fredoka font-bold mb-3 tracking-wide flex items-center justify-center text-white">
            AURA C
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Americas.png" alt="O" className="w-10 h-10 md:w-12 md:h-12 mx-1 inline-block -mt-1 md:-mt-2 drop-shadow-xl animate-spin-y" />
            ACH <span className="text-tealAccent ml-2 font-sans">.AI</span>
          </h1>
          <p className="text-slate-400">
            {isSignUp
              ? 'Sign up to save your progress and vocabulary.'
              : 'Sign in to continue your learning journey.'}
          </p>
        </div>

        <div className={`${styles.card.dark} p-8`}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm">
              {message}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className={`${styles.button.fullWidth} bg-glassBg border border-glassBorder text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed mb-6`}
          >
            {googleLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glassBorder"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-navy text-slate-400">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${styles.input.dark} pl-11`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${styles.input.dark} pl-11`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.button.fullWidth} bg-tealAccent text-navy hover:bg-tealAccent/90 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus size={18} className="mr-2" /> Sign Up
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="relative mb-6 mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glassBorder"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-navy text-slate-400">Or continue as guest</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className={`${styles.button.fullWidth} bg-glassBg border border-glassBorder text-white hover:bg-white/5`}
          >
            <UserPlus size={18} className="mr-2" /> Continue as Guest
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-tealAccent hover:text-tealAccent/80 font-medium transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
