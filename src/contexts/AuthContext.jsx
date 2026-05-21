'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, onAuthStateChanged, firebaseLogout } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // usuario de nuestra DB (via /api/auth/me)
  const [loading, setLoading] = useState(true);

  // Obtener usuario de nuestra API (con rol, etc.)
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        fetch('/api/auth/logout', { method: 'POST' }),
        firebaseLogout(),
      ]);
    } catch {
      // ignorar errores
    }
    setUser(null);
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(() => {
    setLoading(true);
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
