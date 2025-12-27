'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { adminApi } from '../../../lib/api';
import AnimatedBackground from '../../../components/AnimatedBackground';
import type { Doctor } from '../../../types';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, role, initAuth } = useAuthStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, role, loading, router]);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchDoctors();
    }
  }, [isAuthenticated, role]);

  const fetchDoctors = async () => {
    try {
      const response = await adminApi.getAllDoctors({ status: 'VERIFIED' });
      if (response.success && response.data) {
        setDoctors(response.data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredDoctors = doctors.filter((doctor) => {
    if (filter === 'all') return true;
    return doctor.subscriptionStatus === filter.toUpperCase();
  });

  const trialCount = doctors.filter((d) => d.subscriptionStatus === 'TRIAL').length;
  const activeCount = doctors.filter((d) => d.subscriptionStatus === 'ACTIVE').length;
  const expiredCount = doctors.filter((d) => d.subscriptionStatus === 'EXPIRED').length;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
      <AnimatedBackground />
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Subscriptions</h1>
            <p className="text-sm text-gray-700">Manage doctor subscriptions and trial periods</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl transition-all hover:scale-105"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 p-6">
            <p className="text-sm text-gray-700 mb-1">Total Subscriptions</p>
            <p className="text-3xl font-bold text-blue-900">{doctors.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 backdrop-blur-xl border border-yellow-200/50 rounded-3xl shadow-lg shadow-yellow-500/10 p-6">
            <p className="text-sm text-yellow-700 mb-1">Trial</p>
            <p className="text-3xl font-bold text-yellow-900">{trialCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl border border-green-200/50 rounded-3xl shadow-lg shadow-green-500/10 p-6">
            <p className="text-sm text-green-700 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-xl border border-red-200/50 rounded-3xl shadow-lg shadow-red-500/10 p-6">
            <p className="text-sm text-red-700 mb-1">Expired</p>
            <p className="text-3xl font-bold text-red-900">{expiredCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-105 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setFilter('trial')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-105 ${
                filter === 'trial'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Trial ({trialCount})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-105 ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-105 ${
                filter === 'expired'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Expired ({expiredCount})
            </button>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 overflow-hidden">
          <table className="min-w-full divide-y divide-cyan-200/50">
            <thead className="bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Patients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Trial/Subscription Ends
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Razorpay ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-cyan-200/30">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No doctors found
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => {
                  const daysLeft = Math.ceil(
                    (new Date(doctor.trialEndsAt).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={doctor.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-blue-900">
                            {doctor.fullName}
                          </div>
                          <div className="text-sm text-gray-600">{doctor.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        {doctor.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            doctor.subscriptionStatus === 'TRIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : doctor.subscriptionStatus === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {doctor.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        {doctor.patientsCreated}
                        {doctor.subscriptionStatus === 'TRIAL' && ' / 2'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        {doctor.subscriptionStatus === 'TRIAL' ? (
                          <span className={daysLeft > 0 ? 'text-blue-900' : 'text-red-600 font-semibold'}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                          </span>
                        ) : doctor.subscriptionEndsAt ? (
                          new Date(doctor.subscriptionEndsAt).toLocaleDateString()
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {doctor.razorpaySubscriptionId || 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
