'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { appointmentApi } from '../../../lib/api';
import { NotificationProvider } from '../../../context/NotificationContext';
import AnimatedBackground from '../../../components/AnimatedBackground';
import NotificationBell from '../../../components/NotificationBell';

interface Appointment {
  id: string;
  requestedDate: string;
  requestedTimePreference?: string;
  reason?: string;
  scheduledTime?: string;
  proposedTime?: string;
  proposedMessage?: string;
  rejectionReason?: string;
  duration: number;
  status: string;
  consultationType: string;
  createdAt: string;
  patient: {
    id: string;
    fullName: string;
    phone?: string;
    age?: number;
    gender?: string;
  };
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated, role, user, initAuth, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'past'>('pending');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Accept/Reject modal states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [proposedMessage, setProposedMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated || role !== 'DOCTOR') {
      router.push('/doctor/login');
    }
  }, [isAuthenticated, role, initialized, router]);

  useEffect(() => {
    if (isAuthenticated && role === 'DOCTOR') {
      fetchAppointments();
    }
  }, [activeTab, isAuthenticated, role]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === 'pending') {
        response = await appointmentApi.getPendingRequests();
      } else if (activeTab === 'upcoming') {
        response = await appointmentApi.getUpcomingAppointments();
      } else {
        response = await appointmentApi.getPastAppointments();
      }

      if (response.success && response.data) {
        setAppointments(response.data.appointments || []);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedAppointment || !scheduledTime) {
      alert('Please select a scheduled time');
      return;
    }

    try {
      setActionLoading(selectedAppointment.id);
      const response = await appointmentApi.acceptRequest(selectedAppointment.id, {
        scheduledTime,
        duration: selectedAppointment.duration,
      });

      if (response.success) {
        alert('Appointment accepted successfully!');
        setShowAcceptModal(false);
        setScheduledTime('');
        fetchAppointments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePropose = async () => {
    if (!selectedAppointment || !proposedTime || !proposedMessage) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setActionLoading(selectedAppointment.id);
      const response = await appointmentApi.proposeAlternative(selectedAppointment.id, {
        proposedTime,
        proposedMessage,
      });

      if (response.success) {
        alert('Alternative time proposed successfully!');
        setShowProposeModal(false);
        setProposedTime('');
        setProposedMessage('');
        fetchAppointments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to propose alternative');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(selectedAppointment.id);
      const response = await appointmentApi.rejectRequest(selectedAppointment.id, {
        rejectionReason,
      });

      if (response.success) {
        alert('Appointment rejected');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchAppointments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-lg text-blue-900">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'DOCTOR') {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40 pb-20">
        <AnimatedBackground />

        {/* Header */}
        <header className="relative z-50 bg-white border-b border-cyan-200/50 sticky top-0 shadow-lg shadow-cyan-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Mediquory Connect" className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Appointment Requests
                  </h1>
                  <p className="text-sm text-gray-600">Manage patient appointments</p>
                </div>
                <NotificationBell />
              </div>
              <div className="flex gap-2">
                <Link
                  href="/doctor/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/doctor/patients"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-medium transition-all"
                >
                  My Patients
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-cyan-200/50 p-2 mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Past
            </button>
          </div>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-cyan-200/50 p-12 text-center">
              <p className="text-gray-500 text-lg">
                {activeTab === 'pending' && 'No pending appointment requests'}
                {activeTab === 'upcoming' && 'No upcoming appointments'}
                {activeTab === 'past' && 'No past appointments'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl border border-cyan-200/50 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-blue-900">
                          {appointment.patient.fullName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'PROPOSED_ALTERNATIVE' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Requested Date</p>
                          <p className="font-medium text-gray-900">{formatDate(appointment.requestedDate)}</p>
                        </div>
                        {appointment.requestedTimePreference && (
                          <div>
                            <p className="text-gray-600">Time Preference</p>
                            <p className="font-medium text-gray-900">{appointment.requestedTimePreference}</p>
                          </div>
                        )}
                        {appointment.scheduledTime && (
                          <div>
                            <p className="text-gray-600">Scheduled Time</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(appointment.scheduledTime)} at {formatTime(appointment.scheduledTime)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-medium text-gray-900">{appointment.consultationType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Patient Info</p>
                          <p className="font-medium text-gray-900">
                            {appointment.patient.age && appointment.patient.gender
                              ? `${appointment.patient.age}Y, ${appointment.patient.gender}`
                              : 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Reason for appointment:</p>
                          <p className="text-gray-900">{appointment.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {appointment.status === 'REQUESTED' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAcceptModal(true);
                          }}
                          disabled={actionLoading === appointment.id}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowProposeModal(true);
                          }}
                          disabled={actionLoading === appointment.id}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          Propose
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading === appointment.id}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Accept Modal */}
        {showAcceptModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accept Appointment</h3>
              <p className="text-gray-600 mb-4">
                Confirm appointment for <strong>{selectedAppointment.patient.fullName}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={!scheduledTime || actionLoading === selectedAppointment.id}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setScheduledTime('');
                  }}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Propose Modal */}
        {showProposeModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Propose Alternative Time</h3>
              <p className="text-gray-600 mb-4">
                Suggest a different time to <strong>{selectedAppointment.patient.fullName}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Patient
                </label>
                <textarea
                  value={proposedMessage}
                  onChange={(e) => setProposedMessage(e.target.value)}
                  rows={3}
                  placeholder="Explain why you're proposing this alternative time..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePropose}
                  disabled={!proposedTime || !proposedMessage || actionLoading === selectedAppointment.id}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Send Proposal
                </button>
                <button
                  onClick={() => {
                    setShowProposeModal(false);
                    setProposedTime('');
                    setProposedMessage('');
                  }}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Appointment</h3>
              <p className="text-gray-600 mb-4">
                Provide a reason for rejecting <strong>{selectedAppointment.patient.fullName}</strong>'s request
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="e.g., I'm not available on this date..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading === selectedAppointment.id}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NotificationProvider>
  );
}
