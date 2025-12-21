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

  setAuth: (data: { patient: Patient; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updatePatient: (patient: Patient) => void;
}

export const usePatientAuth = create<PatientAuthStore>()(
  persist(
    (set) => ({
      patient: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          patient: data.patient,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          patient: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updatePatient: (patient) =>
        set({
          patient,
        }),
    }),
    {
      name: 'patient-auth-storage',
    }
  )
);
