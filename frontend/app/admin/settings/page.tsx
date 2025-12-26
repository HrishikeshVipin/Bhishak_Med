'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { NotificationProvider } from '../../../context/NotificationContext';
import NotificationBell from '../../../components/NotificationBell';
import AnimatedBackground from '../../../components/AnimatedBackground';
import api from '../../../lib/api';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  description?: string;
  category: string;
  updatedBy?: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, role, clearAuth } = useAuthStore();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    fetchSettings();
  }, [isAuthenticated, role, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: SystemSetting[] }>('/system-settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (setting: SystemSetting) => {
    try {
      setUpdating(setting.key);

      // Toggle the value
      const newValue = setting.value === 'true' ? 'false' : 'true';

      const response = await api.put(`/system-settings/${setting.key}`, {
        value: newValue,
      });

      if (response.data.success) {
        // Update local state
        setSettings(prev =>
          prev.map(s =>
            s.key === setting.key ? { ...s, value: newValue, updatedAt: new Date().toISOString() } : s
          )
        );

        // Show success message
        alert(`${setting.label} has been ${newValue === 'true' ? 'enabled' : 'disabled'} successfully!`);
      }
    } catch (error: any) {
      console.error('Failed to update setting:', error);
      alert(error.response?.data?.message || 'Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-lg text-blue-900">Loading settings...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'ADMIN') {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
        <AnimatedBackground />

        {/* Header */}
        <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 shadow-lg shadow-cyan-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <button className="p-2 hover:bg-cyan-50 rounded-xl transition-all hover:scale-105">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  System Settings
                </h1>
                <p className="text-xs text-gray-600">Manage application configuration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Application Settings</h2>
            <p className="text-gray-600">
              Configure system-wide settings and feature flags. Changes take effect immediately.
            </p>
          </div>

          {/* Settings List */}
          <div className="space-y-6">
            {settings.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-12 text-center shadow-lg">
                <svg className="w-16 h-16 text-cyan-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-900 font-bold mb-2">No Settings Found</p>
                <p className="text-sm text-gray-600">
                  System settings will appear here. Run database migration to create default settings.
                </p>
              </div>
            ) : (
              Object.entries(
                settings.reduce((acc, setting) => {
                  if (!acc[setting.category]) acc[setting.category] = [];
                  acc[setting.category].push(setting);
                  return acc;
                }, {} as Record<string, SystemSetting[]>)
              ).map(([category, categorySettings]) => (
                <div key={category} className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-cyan-200/50 px-6 py-4">
                    <h3 className="text-lg font-bold text-blue-900">{category}</h3>
                  </div>

                  {/* Settings in Category */}
                  <div className="divide-y divide-cyan-200/30">
                    {categorySettings.map((setting) => (
                      <div key={setting.id} className="p-6 hover:bg-cyan-50/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-6">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{setting.label}</h4>
                              {setting.type === 'BOOLEAN' && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  setting.value === 'true'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                                </span>
                              )}
                            </div>
                            {setting.description && (
                              <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{setting.key}</span>
                              <span className="mx-2">•</span>
                              <span>Last updated: {new Date(setting.updatedAt).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Toggle Switch (for BOOLEAN settings) */}
                          {setting.type === 'BOOLEAN' && (
                            <button
                              onClick={() => handleToggle(setting)}
                              disabled={updating === setting.key}
                              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                                setting.value === 'true'
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 focus:ring-green-300'
                                  : 'bg-gray-300 focus:ring-gray-300'
                              } ${updating === setting.key ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                              <span className="sr-only">Toggle {setting.label}</span>
                              <span
                                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                  setting.value === 'true' ? 'translate-x-11' : 'translate-x-1'
                                }`}
                              >
                                {updating === setting.key && (
                                  <svg className="animate-spin h-8 w-8 text-blue-600 p-1.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                )}
                              </span>
                            </button>
                          )}

                          {/* Display value for non-BOOLEAN settings */}
                          {setting.type !== 'BOOLEAN' && (
                            <div className="text-right">
                              <p className="text-lg font-mono font-semibold text-blue-900">{setting.value}</p>
                              <p className="text-xs text-gray-500">{setting.type}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">About System Settings</h4>
                <p className="text-sm text-blue-800">
                  Changes to system settings take effect immediately and override environment variables.
                  Toggle switches make it easy to enable or disable features without redeploying the application.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}
