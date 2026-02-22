import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';

// Reference to the app's QueryClient, set once from App.tsx or index.tsx
let _queryClient: QueryClient | null = null;
export const setQueryClientRef = (qc: QueryClient) => { _queryClient = qc; };

export interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => set({ user, token, isLoading: false }),
      logout: () => {
        set({ user: null, token: null });
        _queryClient?.removeQueries({ queryKey: ['favorites'] });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper: fetch with auth header
export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (res.status === 401) {
    // Token expired — logout
    useAuthStore.getState().logout();
    throw new Error('Session expired');
  }
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'API Error');
  }
  
  return res.json();
};


