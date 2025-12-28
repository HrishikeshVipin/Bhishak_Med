import { create } from 'zustand';
import type { Admin, Doctor } from '../types';

interface AuthState {
  token: string | null;
  user: Admin | Doctor | null;
  isAuthenticated: boolean;
  role: 'ADMIN' | 'DOCTOR' | null;
  initialized: boolean;

  setAuth: (token: string, user: Admin | Doctor, role: 'ADMIN' | 'DOCTOR') => void;
  clearAuth: () => void;
  initAuth: () => void;
  isSuperAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  role: null,
  initialized: false,

  setAuth: (token, user, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', role);
    set({ token, user, isAuthenticated: true, role, initialized: true });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    set({ token: null, user: null, isAuthenticated: false, role: null, initialized: true });
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role') as 'ADMIN' | 'DOCTOR' | null;

    if (token && userStr && role) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, role, initialized: true });
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        set({ initialized: true });
      }
    } else {
      set({ initialized: true });
    }
  },

  isSuperAdmin: () => {
    const { user, role } = get();
    return role === 'ADMIN' && (user as Admin)?.role === 'SUPER_ADMIN';
  },

  hasPermission: (permission: string) => {
    const { user, role } = get();

    // Only admins have permissions
    if (role !== 'ADMIN') {
      return false;
    }

    const admin = user as Admin;

    // SUPER_ADMIN has all permissions
    if (admin?.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if regular ADMIN has the specific permission
    return admin?.permissions?.includes(permission) || false;
  },
}));
