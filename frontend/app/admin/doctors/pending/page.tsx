'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import AnimatedBackground from '../../../../components/AnimatedBackground';
import type { Doctor } from '../../../../types';

export default function PendingDoctorsPage() {
  const router = useRouter();
  const { isAuthenticated, role, initAuth } = useAuthStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, role, loading, router]);

  useEffect(() => {
    const fetchPendingDoctors = async () => {
      try {
        const response = await adminApi.getPendingDoctors();
        if (response.success && response.data) {
          setDoctors(response.data.doctors);
        }
      } catch (err: any) {
        console.error('Failed to fetch pending doctors:', err);
        setError(err.response?.data?.message || 'Failed to load pending doctors');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && role === 'ADMIN') {
      fetchPendingDoctors();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, role]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-lg text-blue-900">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
      <AnimatedBackground />
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Pending Verifications</h1>
              <p className="text-sm text-gray-700 mt-1">
                {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} awaiting verification
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl transition-all hover:scale-105"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {doctors.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 p-8 text-center">
            <div className="text-cyan-400 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-700">No pending doctor verifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface DoctorCardProps {
  doctor: Doctor;
}

function DoctorCard({ doctor }: DoctorCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 hover:shadow-xl transition-all hover:scale-[1.01]">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <span className="text-xl font-semibold text-yellow-800">
                  {doctor.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{doctor.fullName}</h3>
                <p className="text-sm text-gray-700">{doctor.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-blue-900">{doctor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-medium text-blue-900">{doctor.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Type</p>
                <p className="text-sm font-medium text-blue-900">
                  {doctor.registrationType === 'STATE_MEDICAL_COUNCIL'
                    ? `State Medical Council${doctor.registrationState ? ` (${doctor.registrationState})` : ''}`
                    : 'National Medical Commission'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="text-sm font-medium text-blue-900">{doctor.registrationNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Aadhaar</p>
                <p className="text-sm font-medium text-blue-900 font-mono">
                  {doctor.aadhaarNumber
                    ? `XXXX-XXXX-${doctor.aadhaarNumber.substring(8)}`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-sm font-medium text-blue-900">{formatDate(doctor.createdAt)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.registrationCertificate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Registration Certificate ✓
                </span>
              )}
              {doctor.aadhaarFrontPhoto && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Aadhaar Front ✓
                </span>
              )}
              {doctor.aadhaarBackPhoto && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Aadhaar Back ✓
                </span>
              )}
              {doctor.profilePhoto && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Profile Photo ✓
                </span>
              )}
            </div>
          </div>

          <div className="ml-6">
            <Link
              href={`/admin/doctors/${doctor.id}`}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl transition-all hover:scale-105 font-medium"
            >
              Review →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
