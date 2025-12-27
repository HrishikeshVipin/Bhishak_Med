'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { NotificationProvider } from '../../../context/NotificationContext';
import NotificationBell from '../../../components/NotificationBell';
import AnimatedBackground from '../../../components/AnimatedBackground';

type TabType = 'general' | 'admin-access' | 'security';

interface AuditLog {
  id: string;
  actorType: string;
  actorId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  createdAt: string;
  actor?: {
    email?: string;
    fullName?: string;
  };
}

interface AdminAccessLog {
  id: string;
  adminId: string;
  accessType: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  reasonDetails?: string;
  ipAddress?: string;
  expiresAt?: string;
  createdAt: string;
  admin?: {
    email?: string;
    fullName?: string;
  };
}

interface AuditStats {
  totalLogs: number;
  failedLogins: number;
  successfulLogins: number;
  prescriptionsCreated: number;
  paymentsConfirmed: number;
  adminDataAccess: number;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const { isAuthenticated, role, user, clearAuth, initAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Stats
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    failedLogins: 0,
    successfulLogins: 0,
    prescriptionsCreated: 0,
    paymentsConfirmed: 0,
    adminDataAccess: 0,
  });

  // General Logs
  const [generalLogs, setGeneralLogs] = useState<AuditLog[]>([]);
  const [generalPagination, setGeneralPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [generalFilters, setGeneralFilters] = useState({
    actorType: '',
    action: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Admin Access Logs
  const [adminAccessLogs, setAdminAccessLogs] = useState<AdminAccessLog[]>([]);
  const [adminAccessPagination, setAdminAccessPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [adminAccessFilters, setAdminAccessFilters] = useState({
    resourceType: '',
    reason: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Expanded row details
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, role, loading, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getAuditStats(30);
        if (response.success && response.data) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch audit stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && role === 'ADMIN') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, role]);

  // Fetch general logs
  useEffect(() => {
    const fetchGeneralLogs = async () => {
      if (activeTab !== 'general') return;

      try {
        const params: any = {
          page: generalPagination.page,
          limit: generalPagination.limit,
        };

        if (generalFilters.actorType) params.actorType = generalFilters.actorType;
        if (generalFilters.action) params.action = generalFilters.action;
        if (generalFilters.startDate) params.startDate = generalFilters.startDate;
        if (generalFilters.endDate) params.endDate = generalFilters.endDate;
        if (generalFilters.search) params.search = generalFilters.search;

        const response = await adminApi.getAuditLogs(params);
        if (response.success && response.data) {
          setGeneralLogs(response.data.logs);
          setGeneralPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch general logs:', error);
      }
    };

    if (isAuthenticated && role === 'ADMIN') {
      fetchGeneralLogs();
    }
  }, [isAuthenticated, role, activeTab, generalPagination.page, generalFilters]);

  // Fetch admin access logs
  useEffect(() => {
    const fetchAdminAccessLogs = async () => {
      if (activeTab !== 'admin-access') return;

      try {
        const params: any = {
          page: adminAccessPagination.page,
          limit: adminAccessPagination.limit,
        };

        if (adminAccessFilters.resourceType) params.resourceType = adminAccessFilters.resourceType;
        if (adminAccessFilters.reason) params.reason = adminAccessFilters.reason;
        if (adminAccessFilters.startDate) params.startDate = adminAccessFilters.startDate;
        if (adminAccessFilters.endDate) params.endDate = adminAccessFilters.endDate;
        if (adminAccessFilters.search) params.search = adminAccessFilters.search;

        const response = await adminApi.getAdminAccessLogs(params);
        if (response.success && response.data) {
          setAdminAccessLogs(response.data.logs);
          setAdminAccessPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch admin access logs:', error);
      }
    };

    if (isAuthenticated && role === 'ADMIN') {
      fetchAdminAccessLogs();
    }
  }, [isAuthenticated, role, activeTab, adminAccessPagination.page, adminAccessFilters]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/admin/login');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleGeneralFilterChange = (key: string, value: string) => {
    setGeneralFilters((prev) => ({ ...prev, [key]: value }));
    setGeneralPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAdminAccessFilterChange = (key: string, value: string) => {
    setAdminAccessFilters((prev) => ({ ...prev, [key]: value }));
    setAdminAccessPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetGeneralFilters = () => {
    setGeneralFilters({
      actorType: '',
      action: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setGeneralPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetAdminAccessFilters = () => {
    setAdminAccessFilters({
      resourceType: '',
      reason: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setAdminAccessPagination((prev) => ({ ...prev, page: 1 }));
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

  return (
    <NotificationProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
        <AnimatedBackground />

        {/* Header */}
        <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 shadow-lg shadow-cyan-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Mediquory Connect" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Audit Logs</h1>
                <p className="text-sm text-gray-700">Security & Activity Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all hover:scale-105"
              >
                Back to Dashboard
              </button>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Audit Logs"
              value={stats.totalLogs}
              subtitle="Last 30 days"
              color="blue"
            />
            <StatsCard
              title="Failed Logins"
              value={stats.failedLogins}
              subtitle="Security alerts"
              color="red"
            />
            <StatsCard
              title="Successful Logins"
              value={stats.successfulLogins}
              subtitle="Last 30 days"
              color="green"
            />
            <StatsCard
              title="Prescriptions Created"
              value={stats.prescriptionsCreated}
              subtitle="Last 30 days"
              color="blue"
            />
            <StatsCard
              title="Payments Confirmed"
              value={stats.paymentsConfirmed}
              subtitle="Last 30 days"
              color="purple"
            />
            <StatsCard
              title="Admin Data Access"
              value={stats.adminDataAccess}
              subtitle="Sensitive data views"
              color="cyan"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 p-6 mb-6">
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'general'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                General Audit Logs
              </button>
              <button
                onClick={() => setActiveTab('admin-access')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'admin-access'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admin Access Logs
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'security'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Security Alerts
              </button>
            </div>

            {/* General Audit Logs Tab */}
            {activeTab === 'general' && (
              <div>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actor Type
                    </label>
                    <select
                      value={generalFilters.actorType}
                      onChange={(e) => handleGeneralFilterChange('actorType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="ADMIN">Admin</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="PATIENT">Patient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <select
                      value={generalFilters.action}
                      onChange={(e) => handleGeneralFilterChange('action', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                      <option value="FAILED_LOGIN">Failed Login</option>
                      <option value="PRESCRIPTION_CREATE">Prescription Create</option>
                      <option value="PRESCRIPTION_DOWNLOAD">Prescription Download</option>
                      <option value="PAYMENT_CONFIRM">Payment Confirm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={generalFilters.startDate}
                      onChange={(e) => handleGeneralFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={generalFilters.endDate}
                      onChange={(e) => handleGeneralFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Email, IP address..."
                      value={generalFilters.search}
                      onChange={(e) => handleGeneralFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={resetGeneralFilters}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
                  >
                    Reset Filters
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all">
                    Export CSV
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generalLogs.map((log) => (
                        <React.Fragment key={log.id}>
                          <tr
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {log.actor?.fullName || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.actor?.email || log.actorId}
                              </div>
                              <div className="text-xs text-gray-400">{log.actorType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.action}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.resourceType || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.ipAddress || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  log.success
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {log.success ? 'Success' : 'Failed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button className="text-blue-600 hover:text-blue-900">
                                {expandedRow === log.id ? 'Hide' : 'View'}
                              </button>
                            </td>
                          </tr>
                          {expandedRow === log.id && (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Detailed Information
                                  </h4>
                                  {log.errorMessage && (
                                    <div className="mb-2">
                                      <span className="font-medium text-red-600">Error: </span>
                                      <span className="text-red-800">{log.errorMessage}</span>
                                    </div>
                                  )}
                                  {log.userAgent && (
                                    <div className="mb-2">
                                      <span className="font-medium">User Agent: </span>
                                      <span className="text-gray-600 text-sm">{log.userAgent}</span>
                                    </div>
                                  )}
                                  {log.metadata && (
                                    <div>
                                      <span className="font-medium">Metadata: </span>
                                      <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {generalPagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {(generalPagination.page - 1) * generalPagination.limit + 1} to{' '}
                      {Math.min(generalPagination.page * generalPagination.limit, generalPagination.total)}{' '}
                      of {generalPagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setGeneralPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                        disabled={generalPagination.page === 1}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: generalPagination.totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === generalPagination.totalPages ||
                              Math.abs(page - generalPagination.page) <= 2
                          )
                          .map((page, index, array) => (
                            <>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span key={`ellipsis-${page}`} className="px-2">
                                  ...
                                </span>
                              )}
                              <button
                                key={page}
                                onClick={() =>
                                  setGeneralPagination((prev) => ({ ...prev, page }))
                                }
                                className={`px-4 py-2 rounded-lg transition-all ${
                                  generalPagination.page === page
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            </>
                          ))}
                      </div>
                      <button
                        onClick={() =>
                          setGeneralPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                        disabled={generalPagination.page === generalPagination.totalPages}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Access Logs Tab */}
            {activeTab === 'admin-access' && (
              <div>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Type
                    </label>
                    <select
                      value={adminAccessFilters.resourceType}
                      onChange={(e) =>
                        handleAdminAccessFilterChange('resourceType', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="PATIENT">Patient</option>
                      <option value="CONSULTATION">Consultation</option>
                      <option value="PRESCRIPTION">Prescription</option>
                      <option value="PAYMENT">Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={adminAccessFilters.reason}
                      onChange={(e) => handleAdminAccessFilterChange('reason', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="VERIFICATION">Verification</option>
                      <option value="LEGAL_REQUEST">Legal Request</option>
                      <option value="DISPUTE_RESOLUTION">Dispute Resolution</option>
                      <option value="QUALITY_AUDIT">Quality Audit</option>
                      <option value="TECHNICAL_SUPPORT">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={adminAccessFilters.startDate}
                      onChange={(e) => handleAdminAccessFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={adminAccessFilters.endDate}
                      onChange={(e) => handleAdminAccessFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Admin email, resource ID..."
                      value={adminAccessFilters.search}
                      onChange={(e) => handleAdminAccessFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={resetAdminAccessFilters}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
                  >
                    Reset Filters
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all">
                    Export CSV
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminAccessLogs.map((log) => (
                        <>
                          <tr
                            key={log.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {log.admin?.fullName || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.admin?.email || log.adminId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.accessType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.resourceType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {log.reason}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.ipAddress || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button className="text-blue-600 hover:text-blue-900">
                                {expandedRow === log.id ? 'Hide' : 'View'}
                              </button>
                            </td>
                          </tr>
                          {expandedRow === log.id && (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Detailed Information
                                  </h4>
                                  <div className="mb-2">
                                    <span className="font-medium">Resource ID: </span>
                                    <span className="text-gray-600">{log.resourceId}</span>
                                  </div>
                                  {log.reasonDetails && (
                                    <div className="mb-2">
                                      <span className="font-medium">Reason Details: </span>
                                      <span className="text-gray-600">{log.reasonDetails}</span>
                                    </div>
                                  )}
                                  {log.expiresAt && (
                                    <div className="mb-2">
                                      <span className="font-medium">Access Expires At: </span>
                                      <span className="text-gray-600">
                                        {formatDate(log.expiresAt)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {adminAccessPagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {(adminAccessPagination.page - 1) * adminAccessPagination.limit + 1}{' '}
                      to{' '}
                      {Math.min(
                        adminAccessPagination.page * adminAccessPagination.limit,
                        adminAccessPagination.total
                      )}{' '}
                      of {adminAccessPagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setAdminAccessPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                        disabled={adminAccessPagination.page === 1}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: adminAccessPagination.totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === adminAccessPagination.totalPages ||
                              Math.abs(page - adminAccessPagination.page) <= 2
                          )
                          .map((page, index, array) => (
                            <>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span key={`ellipsis-${page}`} className="px-2">
                                  ...
                                </span>
                              )}
                              <button
                                key={page}
                                onClick={() =>
                                  setAdminAccessPagination((prev) => ({ ...prev, page }))
                                }
                                className={`px-4 py-2 rounded-lg transition-all ${
                                  adminAccessPagination.page === page
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            </>
                          ))}
                      </div>
                      <button
                        onClick={() =>
                          setAdminAccessPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                        disabled={
                          adminAccessPagination.page === adminAccessPagination.totalPages
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Alerts Tab */}
            {activeTab === 'security' && (
              <div>
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Security Alerts Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This section will display failed login attempts, suspicious activity, and other
                    security alerts.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Quick Stats:</span> {stats.failedLogins}{' '}
                      failed login attempts detected in the last 30 days.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'red' | 'green' | 'purple' | 'cyan';
}

function StatsCard({ title, value, subtitle, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-orange-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    cyan: 'from-cyan-500 to-blue-600',
  };

  return (
    <div className="rounded-3xl shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      <div
        className={`bg-gradient-to-r ${colorClasses[color]} text-white px-4 py-5 rounded-t-3xl`}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
      <div className="bg-white/70 backdrop-blur-xl px-4 py-6 rounded-b-3xl border-x border-b border-cyan-200/50">
        <p className="text-3xl font-bold text-blue-900">{(value ?? 0).toLocaleString()}</p>
      </div>
    </div>
  );
}
