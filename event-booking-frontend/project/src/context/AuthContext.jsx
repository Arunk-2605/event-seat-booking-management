import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NotConnectedError } from '@/lib/bookingService';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

function toFriendlyAuthError(error) {
  const message = (error?.message || '').toLowerCase();
  if (message.includes('invalid login')) return 'The email or password you entered is incorrect.';
  if (message.includes('email not confirmed')) return 'Please confirm your email first, then sign in.';
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.includes('password')) return error.message;
  if (message.includes('fetch') || message.includes('network')) {
    return 'We could not reach the server. Check your connection and try again.';
  }
  return 'Something went wrong with your account. Please try again.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // The role is read from the profiles TABLE (never from user metadata).
  // We remember which user the role belongs to, so it can never be mixed up.
  const [profile, setProfile] = useState({ userId: null, role: null });

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        if (active) setSession(nextSession);
      })();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!supabase || !userId) return undefined;

    let active = true;

    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile({ userId, role: data?.role ?? null });
      })
      .catch(() => {
        if (active) setProfile({ userId, role: null });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new NotConnectedError();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(toFriendlyAuthError(error));
  }, []);

  const signUp = useCallback(async ({ fullName, email, password }) => {
    if (!supabase) throw new NotConnectedError();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(toFriendlyAuthError(error));
    return { needsConfirmation: !data?.session };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('We could not sign you out. Please try again.');
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    const roleLoading = Boolean(userId) && profile.userId !== userId;
    const role = profile.userId === userId ? profile.role : null;
    return {
      user,
      userName: user?.user_metadata?.full_name || user?.email || '',
      role,
      roleLoading,
      // Only used to show/hide menu items. The database still checks
      // the role inside every organizer function.
      isOrganizer: role === 'organizer',
      loading,
      signIn,
      signUp,
      signOut,
    };
  }, [session, userId, profile, loading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
