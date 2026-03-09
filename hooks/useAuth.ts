import {useState, useEffect} from 'react';
import {supabase} from '../lib/supabase';
import {AppUser} from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const isOAuthCallback =
      window.location.hash.includes('access_token') || window.location.search.includes('code=');

    if (isOAuthCallback) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'OAUTH_AUTH_SUCCESS',
            url: window.location.href,
          },
          '*',
        );
        window.close();
        return;
      } else {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({data}) => {
            if (data?.session) {
              setUser(data.session.user);
              setAuthLoading(false);
            }
          });
        }
      }
    }

    supabase.auth
      .getSession()
      .then(({data: {session}, error}) => {
        const localUser = localStorage.getItem('pragmatic_user');
        if (error) {
          console.warn('Supabase auth failed, using local storage fallback:', error);
          if (localUser) {
            setUser(JSON.parse(localUser));
          } else {
            setUser(null);
          }
        } else {
          if (localUser) {
            setUser(JSON.parse(localUser));
          } else {
            setUser(session?.user ?? null);
          }
        }
        setAuthLoading(false);
      })
      .catch((err) => {
        console.warn('Supabase auth failed, using local storage fallback:', err);
        const localUser = localStorage.getItem('pragmatic_user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const localUser = localStorage.getItem('pragmatic_user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        setUser(session?.user ?? null);
      }
    });

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.url) {
        try {
          const url = new URL(event.data.url);
          const code = url.searchParams.get('code');

          if (code) {
            const {data} = await supabase.auth.exchangeCodeForSession(code);
            if (data?.session) {
              setUser(data.session.user);
            }
          } else if (url.hash.includes('access_token')) {
            const params = new URLSearchParams(url.hash.substring(1));
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token && refresh_token) {
              await supabase.auth.setSession({access_token, refresh_token});
            }
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
        }

        supabase.auth.getSession().then(({data: {session}}) => {
          const localUser = localStorage.getItem('pragmatic_user');
          if (localUser) {
            setUser(JSON.parse(localUser));
          } else {
            setUser(session?.user ?? null);
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return {user, setUser, authLoading, setAuthLoading};
};
