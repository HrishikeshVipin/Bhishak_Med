'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/store/patientAuthStore';
import api from '@/lib/api';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  reviewText?: string;
  patientName: string;
  createdAt: string;
}

export default function DoctorPublicProfile({ params }: { params: { doctorId: string } }) {
  const router = useRouter();
  const { isAuthenticated } = usePatientAuth();

  const [doctor, setDoctor] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDist, setRatingDist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/patient/login');
      return;
    }

    fetchDoctorProfile();
  }, [isAuthenticated, params.doctorId]);

  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      const response = await api.doctorDiscovery.getPublicProfile(params.doctorId);

      if (response.success && response.data) {
        setDoctor(response.data.doctor);
        setReviews(response.data.reviews);
        setRatingDist(response.data.ratingDistribution);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-900 font-semibold mb-2">{error || 'Doctor not found'}</p>
          <Link href="/patient/doctors" className="text-blue-600 hover:text-blue-700">
            ← Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/patient/doctors">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Doctor Profile</h1>
              <p className="text-xs text-gray-500">View details and reviews</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doctor Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{doctor.fullName}</h2>
                  <p className="text-gray-600 mb-2">{doctor.specialization}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {doctor.doctorType}
                    </span>
                    {doctor.isOnline && (
                      <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              {doctor.totalReviews > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">{renderStars(doctor.averageRating || 0)}</div>
                  <span className="text-lg font-semibold text-gray-900">
                    {doctor.averageRating?.toFixed(1)}
                  </span>
                  <span className="text-gray-600">({doctor.totalReviews} reviews)</span>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {doctor.yearsExperience && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <p className="font-semibold text-gray-900">{doctor.yearsExperience} years</p>
                  </div>
                )}
                {doctor.consultationFee && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Consultation Fee</p>
                    <p className="font-semibold text-green-600">
                      ₹{(doctor.consultationFee / 100).toFixed(0)}
                    </p>
                  </div>
                )}
                {doctor.languagesSpoken && doctor.languagesSpoken.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Languages</p>
                    <p className="font-semibold text-gray-900">
                      {doctor.languagesSpoken.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Bio */}
              {doctor.bio && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{doctor.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => alert('Booking consultation feature coming soon!')}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Consultation
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Reviews</h3>

          {/* Rating Distribution */}
          {ratingDist && doctor.totalReviews > 0 && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {doctor.averageRating?.toFixed(1)}
                  </div>
                  <div className="flex justify-center md:justify-start mb-2">
                    {renderStars(doctor.averageRating || 0)}
                  </div>
                  <p className="text-gray-600">{doctor.totalReviews} total reviews</p>
                </div>

                {/* Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-8">{star} ★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${doctor.totalReviews > 0 ? (ratingDist[star] / doctor.totalReviews) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{ratingDist[star]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {review.patientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{review.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.reviewText && (
                    <p className="text-gray-700 mt-3">{review.reviewText}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
