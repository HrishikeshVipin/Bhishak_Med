import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Patient {
  id: string;
  phone: string;
  fullName: string;
  age?: number;
  gender?: string;
  accountType: string;
}

interface PatientAuthStore {
  patient: Patient | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  initialized: boolean;

  setAuth: (data: { patient: Patient; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updatePatient: (patient: Patient) => void;
  setInitialized: () => void;
}

export const usePatientAuth = create<PatientAuthStore>()(
  persist(
    (set) => ({
      patient: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      initialized: false,

      setAuth: (data) =>
        set({
          patient: data.patient,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          initialized: true,
        }),

      logout: () =>
        set({
          patient: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          initialized: true,
        }),

      updatePatient: (patient) =>
        set({
          patient,
        }),

      setInitialized: () =>
        set({
          initialized: true,
        }),
    }),
    {
      name: 'patient-auth-storage',
      onRehydrateStorage: () => (state) => {
        // Mark as initialized after rehydration
        if (state) {
          state.initialized = true;
        }
      },
    }
  )
);
