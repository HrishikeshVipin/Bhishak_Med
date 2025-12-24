'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/store/patientAuthStore';
import { patientAuth } from '@/lib/api';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

interface Prescription {
  id: string;
  consultationId: string;
  consultationDate: string;
  doctor: {
    fullName: string;
    specialization: string;
  };
  diagnosis: string;
  medications: any;
  instructions: string;
  pdfPath?: string;
  createdAt: string;
}

interface Vital {
  id: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  temperature?: number;
  heartRate?: number;
  oxygenLevel?: number;
  notes?: string;
  createdAt: string;
}

interface MedicalUpload {
  id: string;
  fileName: string;
  fileType: string;
  description?: string;
  filePath: string;
  createdAt: string;
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { isAuthenticated } = usePatientAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'vitals' | 'uploads'>('prescriptions');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [medicalUploads, setMedicalUploads] = useState<MedicalUpload[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/patient/login');
      return;
    }

    fetchMedicalRecords();
  }, [isAuthenticated]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await patientAuth.getMyMedicalRecords();
      if (response.success && response.data) {
        setPrescriptions(response.data.prescriptions || []);
        setVitals(response.data.vitals || []);
        setMedicalUploads(response.data.medicalUploads || []);
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40 relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-cyan-200/50 sticky top-0 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/patient/dashboard">
                <button className="p-2 hover:bg-cyan-50 rounded-xl transition-all hover:scale-105">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Medical Records</h1>
                <p className="text-xs text-gray-600">View your health records</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-lg shadow-cyan-500/10 p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'prescriptions'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'vitals'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              Vitals ({vitals.length})
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === 'uploads'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              Uploads ({medicalUploads.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading records...</p>
          </div>
        ) : (
          <>
            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-3xl border border-cyan-200/50 shadow-lg shadow-cyan-500/10">
                    <svg className="w-16 h-16 text-cyan-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-900 font-bold mb-2">No prescriptions yet</p>
                    <p className="text-sm text-gray-600">Your prescriptions will appear here after consultations</p>
                  </div>
                ) : (
                  prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-6 shadow-lg shadow-cyan-500/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">{prescription.doctor.fullName}</h3>
                          <p className="text-sm text-gray-600">{prescription.doctor.specialization}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(prescription.consultationDate)}</p>
                        </div>
                        {prescription.pdfPath && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}${prescription.pdfPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
                          >
                            Download PDF
                          </a>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="bg-blue-50/50 rounded-xl p-3">
                          <p className="text-xs text-gray-600 font-medium mb-1">Diagnosis</p>
                          <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
                        </div>
                        {prescription.medications && typeof prescription.medications === 'object' && Array.isArray(prescription.medications) && (
                          <div className="bg-green-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-2">Medications</p>
                            <ul className="space-y-1">
                              {prescription.medications.map((med: any, idx: number) => (
                                <li key={idx} className="text-sm text-gray-900">
                                  • {med.name} - {med.dosage} ({med.frequency})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {prescription.instructions && (
                          <div className="bg-purple-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Instructions</p>
                            <p className="text-sm text-gray-900">{prescription.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                {vitals.length === 0 ? (
                  <div className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-3xl border border-cyan-200/50 shadow-lg shadow-cyan-500/10">
                    <svg className="w-16 h-16 text-cyan-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-900 font-bold mb-2">No vitals recorded</p>
                    <p className="text-sm text-gray-600">Your vital signs will appear here</p>
                  </div>
                ) : (
                  vitals.map((vital) => (
                    <div
                      key={vital.id}
                      className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-6 shadow-lg shadow-cyan-500/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Vitals Record</h3>
                        <p className="text-xs text-gray-500">{formatDate(vital.createdAt)}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vital.weight && (
                          <div className="bg-blue-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Weight</p>
                            <p className="text-lg font-bold text-blue-600">{vital.weight} kg</p>
                          </div>
                        )}
                        {vital.height && (
                          <div className="bg-green-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Height</p>
                            <p className="text-lg font-bold text-green-600">{vital.height} cm</p>
                          </div>
                        )}
                        {vital.bloodPressure && (
                          <div className="bg-red-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Blood Pressure</p>
                            <p className="text-lg font-bold text-red-600">{vital.bloodPressure}</p>
                          </div>
                        )}
                        {vital.temperature && (
                          <div className="bg-orange-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Temperature</p>
                            <p className="text-lg font-bold text-orange-600">{vital.temperature}°F</p>
                          </div>
                        )}
                        {vital.heartRate && (
                          <div className="bg-pink-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Heart Rate</p>
                            <p className="text-lg font-bold text-pink-600">{vital.heartRate} bpm</p>
                          </div>
                        )}
                        {vital.oxygenLevel && (
                          <div className="bg-cyan-50/50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 font-medium mb-1">Oxygen Level</p>
                            <p className="text-lg font-bold text-cyan-600">{vital.oxygenLevel}%</p>
                          </div>
                        )}
                      </div>
                      {vital.notes && (
                        <div className="mt-3 bg-gray-50/50 rounded-xl p-3">
                          <p className="text-xs text-gray-600 font-medium mb-1">Notes</p>
                          <p className="text-sm text-gray-900">{vital.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Uploads Tab */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                {medicalUploads.length === 0 ? (
                  <div className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-3xl border border-cyan-200/50 shadow-lg shadow-cyan-500/10">
                    <svg className="w-16 h-16 text-cyan-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-900 font-bold mb-2">No files uploaded</p>
                    <p className="text-sm text-gray-600">Your uploaded medical reports will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalUploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-6 shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/20 transition-all"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{upload.fileName}</h4>
                            <p className="text-xs text-gray-500">{formatDate(upload.createdAt)}</p>
                          </div>
                        </div>
                        {upload.description && (
                          <p className="text-sm text-gray-600 mb-3">{upload.description}</p>
                        )}
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${upload.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold text-center transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
                        >
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
