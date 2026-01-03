'use client';

import { useState, useEffect } from 'react';
import { feedbackApi } from '@/lib/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<'rating' | 'details'>('rating');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<'RATING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL_FEEDBACK'>('RATING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'UI/UX' | 'PERFORMANCE' | 'FEATURES' | 'BUGS' | 'OTHER'>('OTHER');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTimeout(() => {
        setStep('rating');
        setRating(0);
        setHoveredRating(0);
        setFeedbackType('RATING');
        setTitle('');
        setDescription('');
        setCategory('OTHER');
        setPriority('MEDIUM');
        setSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Get device info
      const deviceInfo = `${navigator.userAgent}`;

      await feedbackApi.submitFeedback({
        type: feedbackType,
        rating: feedbackType === 'RATING' ? rating : undefined,
        title: title.trim() || undefined,
        description: description.trim(),
        category: feedbackType !== 'RATING' ? category : undefined,
        priority: feedbackType === 'BUG_REPORT' || feedbackType === 'FEATURE_REQUEST' ? priority : undefined,
        deviceInfo,
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <svg
          className={`w-12 h-12 ${
            star <= (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Share Your Feedback
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {step === 'rating' ? (
                <>
                  {/* Rating */}
                  <div>
                    <label className="block text-center text-lg font-semibold text-gray-900 mb-4">
                      How would you rate Mediquory Connect?
                    </label>
                    <div className="flex justify-center gap-2 mb-2">{renderStars()}</div>
                    <div className="text-center">
                      {rating > 0 && (
                        <p className="text-sm text-gray-600">
                          {rating === 1 && 'Poor'}
                          {rating === 2 && 'Fair'}
                          {rating === 3 && 'Good'}
                          {rating === 4 && 'Very Good'}
                          {rating === 5 && 'Excellent'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Want to share more? (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackType('FEATURE_REQUEST');
                          setStep('details');
                        }}
                        className="px-4 py-3 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="font-semibold text-gray-900">💡 Feature Request</div>
                        <div className="text-xs text-gray-600">Suggest new features</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackType('BUG_REPORT');
                          setStep('details');
                        }}
                        className="px-4 py-3 border-2 border-red-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left"
                      >
                        <div className="font-semibold text-gray-900">🐛 Bug Report</div>
                        <div className="text-xs text-gray-600">Report an issue</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackType('GENERAL_FEEDBACK');
                          setStep('details');
                        }}
                        className="px-4 py-3 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="font-semibold text-gray-900">💬 General Feedback</div>
                        <div className="text-xs text-gray-600">Share your thoughts</div>
                      </button>
                      <div className="flex items-center justify-center text-sm text-gray-500">
                        or just rate and submit
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Detailed Feedback Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief title for your feedback"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={5}
                      maxLength={2000}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us more about your feedback..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length} / 2000</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="UI/UX">UI/UX</option>
                        <option value="PERFORMANCE">Performance</option>
                        <option value="FEATURES">Features</option>
                        <option value="BUGS">Bugs</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {(feedbackType === 'BUG_REPORT' || feedbackType === 'FEATURE_REQUEST') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as any)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              {step === 'details' && (
                <button
                  type="button"
                  onClick={() => setStep('rating')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || (step === 'rating' && rating === 0) || (step === 'details' && !description.trim())}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
