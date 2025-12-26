'use client';

import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function PatientComingSoonPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40 flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="Mediquory Connect"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Coming Soon Badge */}
        <div className="inline-block mb-6">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
            Coming Soon
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-900 via-cyan-600 to-blue-900 bg-clip-text text-transparent mb-6">
          Patient Registration Opening Soon
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          We're preparing to launch our patient portal with amazing features.
          For early access to consultations, ask your doctor for a personalized invite link.
        </p>

        {/* Feature List */}
        <div className="bg-white/70 backdrop-blur-xl border border-cyan-200/50 rounded-3xl p-8 mb-8 shadow-lg shadow-cyan-500/10">
          <h2 className="text-xl font-bold text-blue-900 mb-4">What's Coming:</h2>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Instant video consultations with verified doctors</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Book appointments with specialists</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Access your medical records & prescriptions anytime</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure health data storage</span>
            </li>
          </ul>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/30 mb-8">
          <h3 className="text-2xl font-bold mb-3">Need a Consultation Now?</h3>
          <p className="mb-6 text-blue-50">
            Ask your doctor to send you a personalized invite link for immediate access to telemedicine services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
            >
              Go to Homepage
            </Link>
            <Link
              href="/doctor/login"
              className="inline-block px-8 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-all hover:scale-105 shadow-lg border-2 border-white/30"
            >
              Doctor Login
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-600">
          Questions? Contact your healthcare provider for more information.
        </p>
      </div>
    </div>
  );
}
