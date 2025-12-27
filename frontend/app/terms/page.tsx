'use client';

import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Terms and Conditions</h1>
          <p className="text-gray-600 mt-2">Last Updated: December 27, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Mediquory Connect (also referred to as "Bhishak Med"). These Terms and Conditions
              ("Terms") govern your use of our telemedicine platform. By accessing or using our services,
              you agree to be bound by these Terms. If you do not agree with any part of these Terms,
              please do not use our platform.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Services Provided</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Mediquory Connect provides a digital platform that connects doctors and patients for remote
              medical consultations. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Video and chat-based medical consultations</li>
              <li>Electronic prescription generation and management</li>
              <li>Patient health records management</li>
              <li>Appointment scheduling and reminders</li>
              <li>Payment processing for consultation fees</li>
              <li>Doctor-patient communication tools</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Important:</strong> Mediquory Connect is a technology platform that facilitates
              communication between healthcare providers and patients. We do not provide medical advice,
              diagnosis, or treatment directly.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">3.1 Doctor Accounts</h3>
                <p className="leading-relaxed mt-1">
                  Doctors must provide valid medical credentials including registration number,
                  Aadhaar number, and specialization. All doctor accounts are subject to verification
                  by our admin team before activation. Doctors are responsible for maintaining the
                  confidentiality of their account credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">3.2 Patient Accounts</h3>
                <p className="leading-relaxed mt-1">
                  Patients can access the platform through unique registration links provided by their
                  doctors. Patients are responsible for providing accurate health information and
                  maintaining the confidentiality of their access credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">3.3 Account Security</h3>
                <p className="leading-relaxed mt-1">
                  You are responsible for maintaining the security of your account credentials.
                  Notify us immediately of any unauthorized access or security breaches.
                </p>
              </div>
            </div>
          </section>

          {/* Doctor Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Doctor Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintain valid medical licenses and registrations</li>
              <li>Provide accurate and truthful information during registration</li>
              <li>Conduct consultations in accordance with medical ethics and standards</li>
              <li>Maintain patient confidentiality and data privacy</li>
              <li>Issue prescriptions only after proper examination and diagnosis</li>
              <li>Respond to patient queries in a timely and professional manner</li>
              <li>Comply with all applicable medical laws and regulations in India</li>
              <li>Report any technical issues or concerns to the platform administrators</li>
            </ul>
          </section>

          {/* Patient Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Patient Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate and complete medical history and information</li>
              <li>Follow prescribed treatments and medication instructions</li>
              <li>Attend scheduled consultations or notify the doctor of cancellations</li>
              <li>Make timely payments for consultation fees</li>
              <li>Use the platform only for legitimate medical consultations</li>
              <li>Respect the doctor's time and professional expertise</li>
              <li>Seek emergency medical care when necessary (do not rely solely on telemedicine for emergencies)</li>
            </ul>
          </section>

          {/* Subscription and Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Subscription and Payments</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">6.1 Doctor Subscriptions</h3>
                <p className="leading-relaxed mt-1">
                  Doctors can access the platform through subscription plans (Trial, Basic, Professional,
                  Enterprise). Subscription fees must be paid in advance. Trial accounts have limited
                  features and patient slots. Subscriptions auto-renew unless cancelled before the renewal date.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">6.2 Consultation Payments</h3>
                <p className="leading-relaxed mt-1">
                  Patients pay consultation fees directly to doctors via UPI or other payment methods.
                  Mediquory Connect does not charge any commission on consultations. Payment confirmation
                  is required before consultation completion.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">6.3 Refunds</h3>
                <p className="leading-relaxed mt-1">
                  Subscription fees are non-refundable except as required by law. Consultation fee refunds
                  are at the discretion of the individual doctor.
                </p>
              </div>
            </div>
          </section>

          {/* Data Privacy and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Data Privacy and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We take data privacy seriously and comply with the Digital Personal Data Protection Act (DPDPA)
              2023 of India. Key privacy measures include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>End-to-end encryption for sensitive medical data</li>
              <li>Secure storage of Aadhaar, UPI, and prescription information</li>
              <li>Audit logging of all data access and modifications</li>
              <li>Limited admin access with mandatory justification and time-limited viewing</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              For detailed information, please refer to our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Users must not:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the platform for illegal or fraudulent activities</li>
              <li>Share account credentials with unauthorized persons</li>
              <li>Attempt to hack, compromise, or reverse-engineer the platform</li>
              <li>Upload malware, viruses, or harmful code</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Misrepresent medical credentials or qualifications</li>
              <li>Prescribe controlled substances without proper authorization</li>
              <li>Use the platform for non-medical purposes</li>
              <li>Scrape or extract data from the platform without authorization</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content, features, and functionality on the Mediquory Connect platform, including but not
              limited to text, graphics, logos, and software, are the exclusive property of Mediquory Connect
              and are protected by copyright, trademark, and other intellectual property laws. Users may not
              reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          {/* Liability and Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Liability and Disclaimers</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">10.1 Medical Disclaimer</h3>
                <p className="leading-relaxed mt-1">
                  Mediquory Connect is a platform provider only. We do not provide medical advice, diagnosis,
                  or treatment. All medical decisions and consultations are between doctors and patients.
                  The platform is not a substitute for in-person medical care or emergency services.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">10.2 Platform Availability</h3>
                <p className="leading-relaxed mt-1">
                  We strive to maintain platform availability but do not guarantee uninterrupted service.
                  We are not liable for temporary outages, maintenance downtime, or technical issues beyond
                  our control.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">10.3 Limitation of Liability</h3>
                <p className="leading-relaxed mt-1">
                  To the maximum extent permitted by law, Mediquory Connect shall not be liable for any
                  indirect, incidental, special, or consequential damages arising from the use or inability
                  to use the platform. Our total liability shall not exceed the amount paid by you for
                  services in the past 12 months.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We reserve the right to suspend or terminate user accounts for violations of these Terms,
              including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Providing false or fraudulent information</li>
              <li>Engaging in prohibited activities</li>
              <li>Non-payment of subscription fees</li>
              <li>Medical malpractice or ethical violations</li>
              <li>Repeated complaints from other users</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Users may terminate their accounts at any time through account settings. Termination does not
              waive payment obligations or erase audit logs required for legal compliance.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes arising from these Terms or the use of the platform shall be subject to the
              exclusive jurisdiction of the courts in Kerala, India.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective upon
              posting to the platform. Your continued use of the platform after changes constitutes
              acceptance of the modified Terms. We will notify users of significant changes via email
              or platform notifications.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              For questions, concerns, or support regarding these Terms or the platform, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
              <p><strong>Email:</strong> support@mediquory-connect.com</p>
              <p className="mt-2"><strong>Platform:</strong> Admin support via in-app messaging</p>
              <p className="mt-2"><strong>Location:</strong> Kerala, India</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">Acceptance of Terms</h2>
            <p className="text-indigo-800 leading-relaxed">
              By using Mediquory Connect, you acknowledge that you have read, understood, and agree to be
              bound by these Terms and Conditions. If you do not agree, please discontinue use of the platform.
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6">
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Privacy Policy
          </Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
