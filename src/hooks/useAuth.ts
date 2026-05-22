'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    } catch (e) {
      // Silencieux : ne pas interrompre le flux d'auth
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { name, role: 'client' },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined
      },
    });
    return { data, error };
  }, []);

  const signOut = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    }
    setUser(null);
    setProfile(null);
  }, []);

  return { user, profile, loading, signIn, signUp, signOut };
}
