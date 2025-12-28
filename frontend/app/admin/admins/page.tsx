'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import AnimatedBackground from '../../../components/AnimatedBackground';
import type { Admin } from '../../../types';

export default function AdminManagementPage() {
  const router = useRouter();
  const { isAuthenticated, role, isSuperAdmin, user } = useAuthStore();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Stats
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [superAdminCount, setSuperAdminCount] = useState(0);
  const [activeAdminCount, setActiveAdminCount] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
  });

  const [editData, setEditData] = useState({
    fullName: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
    isActive: true,
  });

  // Role guard
  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== 'ADMIN' || !isSuperAdmin())) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, role, isSuperAdmin, loading, router]);

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdmins({ page: pagination.page, limit: pagination.limit });

      if (response.success && response.data) {
        setAdmins(response.data.admins);
        setPagination(response.data.pagination);

        // Calculate stats
        const total = response.data.admins.length;
        const superAdmins = response.data.admins.filter((a: Admin) => a.role === 'SUPER_ADMIN').length;
        const active = response.data.admins.filter((a: Admin) => a.isActive).length;

        setTotalAdmins(total);
        setSuperAdminCount(superAdmins);
        setActiveAdminCount(active);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN' && isSuperAdmin()) {
      fetchAdmins();
    }
  }, [isAuthenticated, role, isSuperAdmin, pagination.page]);

  // Create admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await adminApi.createAdmin(formData);

      if (response.success) {
        alert('Admin created successfully!');
        setShowCreateModal(false);
        setFormData({ email: '', password: '', fullName: '', role: 'ADMIN' });
        fetchAdmins();
      } else {
        alert(response.message || 'Failed to create admin');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create admin');
    }
  };

  // Update admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAdmin) return;

    try {
      const response = await adminApi.updateAdmin(selectedAdmin.id, editData);

      if (response.success) {
        alert('Admin updated successfully!');
        setShowEditModal(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        alert(response.message || 'Failed to update admin');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update admin');
    }
  };

  // Delete admin
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await adminApi.deleteAdmin(selectedAdmin.id);

      if (response.success) {
        alert('Admin deleted successfully!');
        setShowDeleteModal(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        alert(response.message || 'Failed to delete admin');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  // Toggle active
  const handleToggleActive = async (admin: Admin) => {
    try {
      const response = await adminApi.toggleAdminActive(admin.id);

      if (response.success) {
        alert(`Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully!`);
        fetchAdmins();
      } else {
        alert(response.message || 'Failed to toggle admin status');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to toggle admin status');
    }
  };

  // Open edit modal
  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditData({
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
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

  if (!isAuthenticated || role !== 'ADMIN' || !isSuperAdmin()) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Admin Management</h1>
            <p className="text-sm text-gray-700">Manage admin accounts and permissions</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total Admins" value={totalAdmins} color="blue" />
          <StatsCard title="Super Admins" value={superAdminCount} color="purple" />
          <StatsCard title="Active Admins" value={activeAdminCount} color="green" />
        </div>

        {/* Create Admin Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:scale-105"
          >
            + Create New Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Last Login</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{admin.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          admin.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          admin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(admin)}
                          className={`px-3 py-1 rounded-lg text-xs transition-all ${
                            admin.isActive
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Create New Admin</h2>
            <form onSubmit={handleCreateAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (min 8 chars, 1 uppercase, 1 number)
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Edit Admin</h2>
            <form onSubmit={handleUpdateAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.isActive}
                      onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                >
                  Update Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Admin</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{selectedAdmin.fullName}</strong>? This will deactivate their account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="rounded-3xl shadow-lg shadow-cyan-500/10 overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white px-4 py-5 rounded-t-3xl`}>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="bg-white/70 backdrop-blur-xl px-4 py-6 rounded-b-3xl border-x border-b border-cyan-200/50">
        <p className="text-3xl font-bold text-blue-900">{value}</p>
      </div>
    </div>
  );
}
