import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { AuthContextType } from './types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Coba dapatkan sesi saat komponen pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Dengarkan perubahan status otentikasi (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // Set loading ke false setelah event pertama diterima jika diperlukan
        if (isLoading) setIsLoading(false);
      }
    );

    // Hentikan listener saat komponen di-unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isLoading]);

  const login = useCallback(async (email: string, password_param: string): Promise<boolean> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password_param,
    });
    setIsLoading(false);
    if (error) {
      console.error("Login error:", error.message);
      return false;
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // onAuthStateChange akan secara otomatis mengupdate state
    setIsLoading(false);
  }, []);

  const value = {
    isAuthenticated: !!session, // User dianggap terotentikasi jika ada sesi
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
