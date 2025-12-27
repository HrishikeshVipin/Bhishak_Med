'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last Updated: December 27, 2025</p>
          <p className="text-sm text-gray-500 mt-1">
            Compliant with Digital Personal Data Protection Act (DPDPA) 2023, India
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Mediquory Connect ("we", "us", "our") is committed to protecting your privacy and personal data.
              This Privacy Policy explains how we collect, use, store, and protect your information in
              compliance with the Digital Personal Data Protection Act (DPDPA) 2023 of India and other
              applicable data protection laws.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              By using our telemedicine platform, you consent to the data practices described in this policy.
              If you do not agree with this policy, please do not use our services.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">2.1 Doctor Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Identity Data:</strong> Full name, email address, phone number</li>
                  <li><strong>Professional Data:</strong> Medical registration number, specialization, qualifications</li>
                  <li><strong>Government ID:</strong> Aadhaar number (encrypted and stored securely)</li>
                  <li><strong>Financial Data:</strong> UPI ID for receiving consultation payments (encrypted)</li>
                  <li><strong>Profile Data:</strong> Profile photo, clinic address, consultation fees</li>
                  <li><strong>Usage Data:</strong> Login history, consultation records, prescription history</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">2.2 Patient Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Identity Data:</strong> Full name, age, gender, phone number (optional)</li>
                  <li><strong>Medical Data:</strong> Health complaints, medical history, vital signs, symptoms</li>
                  <li><strong>Consultation Data:</strong> Chat transcripts, video consultation records, prescriptions</li>
                  <li><strong>Payment Data:</strong> Payment proof images, transaction amounts</li>
                  <li><strong>Access Data:</strong> Unique access tokens for platform access</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">2.3 Technical Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>IP address and location data</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>Usage analytics (pages visited, features used, time spent)</li>
                  <li>Cookie data and session information</li>
                  <li>Error logs and diagnostic data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use collected data for the following purposes:
            </p>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">3.1 Service Provision</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Facilitating doctor-patient consultations</li>
                  <li>Generating and storing electronic prescriptions</li>
                  <li>Processing consultation payments</li>
                  <li>Sending appointment reminders and notifications</li>
                  <li>Managing user accounts and authentication</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">3.2 Verification and Compliance</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Verifying doctor credentials and medical registrations</li>
                  <li>Complying with legal and regulatory requirements</li>
                  <li>Preventing fraud and unauthorized access</li>
                  <li>Maintaining audit logs for legal compliance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">3.3 Platform Improvement</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analyzing usage patterns to improve features</li>
                  <li>Troubleshooting technical issues</li>
                  <li>Conducting security audits and updates</li>
                  <li>Developing new features based on user needs</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">3.4 Communication</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Sending system notifications and alerts</li>
                  <li>Providing customer support</li>
                  <li>Sending subscription renewal reminders</li>
                  <li>Notifying about policy updates (we will NOT send marketing emails)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Security Measures</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We implement industry-standard security measures to protect your data:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-blue-900">🔒 Encryption</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                  <li><strong>AES-256-GCM Encryption:</strong> All sensitive data (Aadhaar, UPI, prescriptions, medical records) is encrypted at rest</li>
                  <li><strong>HTTPS/TLS:</strong> All data transmission is encrypted in transit</li>
                  <li><strong>Secure Key Management:</strong> Encryption keys stored in secure environment variables</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-blue-900">🛡️ Access Controls</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                  <li><strong>Masked Data Display:</strong> Aadhaar numbers always displayed as XXXX-XXXX-1234</li>
                  <li><strong>Time-Limited Access:</strong> Admin can view full Aadhaar only for 15 seconds with mandatory justification</li>
                  <li><strong>Role-Based Access:</strong> Strict access controls based on user roles (Admin, Doctor, Patient)</li>
                  <li><strong>Authentication:</strong> JWT-based secure authentication with bcrypt password hashing</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-blue-900">📋 Audit Logging</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                  <li>All data access and modifications are logged</li>
                  <li>Admin access to sensitive data requires mandatory reasons</li>
                  <li>Logs include IP address, timestamp, and user details</li>
                  <li>Failed login attempts are tracked and logged</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-blue-900">💾 Data Backup</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                  <li>Regular automated backups to prevent data loss</li>
                  <li>Secure backup storage with encryption</li>
                  <li>Disaster recovery procedures in place</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
            <div className="space-y-3 text-gray-700">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✓ What We DO</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Share patient data with their assigned doctor for consultation purposes</li>
                  <li>Disclose data when legally required (court orders, law enforcement requests)</li>
                  <li>Share anonymized, aggregated data for research (no personal identifiers)</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">✗ What We DO NOT Do</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We do NOT sell your personal data to third parties</li>
                  <li>We do NOT share your medical records with pharmaceutical companies</li>
                  <li>We do NOT use your data for targeted advertising</li>
                  <li>We do NOT disclose your information without your consent (except legal requirements)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                We retain your data for as long as necessary to provide services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Medical Records:</strong> Retained for 7 years (as per Indian medical record retention guidelines)</li>
                <li><strong>Audit Logs:</strong> Retained for 5 years for legal compliance</li>
                <li><strong>Financial Records:</strong> Retained for 7 years (as per Income Tax Act requirements)</li>
                <li><strong>Deleted Accounts:</strong> Personal data deleted within 90 days, except legally required records</li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Your Rights Under DPDPA 2023</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              As per the Digital Personal Data Protection Act 2023, you have the following rights:
            </p>
            <div className="space-y-3 text-gray-700">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900">Right to Access</h3>
                <p className="text-sm mt-1">You can request a copy of your personal data we hold.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900">Right to Correction</h3>
                <p className="text-sm mt-1">You can update or correct inaccurate personal information.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900">Right to Erasure</h3>
                <p className="text-sm mt-1">You can request deletion of your data (subject to legal retention requirements).</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900">Right to Data Portability</h3>
                <p className="text-sm mt-1">You can request your data in a machine-readable format.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900">Right to Withdraw Consent</h3>
                <p className="text-sm mt-1">You can withdraw consent for data processing (may affect service access).</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-gray-900">Right to Grievance Redressal</h3>
                <p className="text-sm mt-1">You can file complaints about data handling practices.</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at <strong>support@mediquory-connect.com</strong>.
              We will respond within 30 days of receiving your request.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar technologies to enhance user experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and session management</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences (language, settings)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Railway (Cloud Hosting):</strong> For secure server hosting in Singapore region</li>
              <li><strong>Socket.io:</strong> For real-time consultation communication</li>
              <li><strong>Payment Gateways:</strong> UPI-based payment processing (patient to doctor direct)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              These services have their own privacy policies. We ensure they comply with data protection standards.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform is intended for users aged 18 and above. For patients under 18, parental/guardian
              consent is required. We do not knowingly collect data from children without guardian consent.
              If you believe we have inadvertently collected such data, please contact us immediately.
            </p>
          </section>

          {/* Data Breach Notification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Data Breach Notification</h2>
            <p className="text-gray-700 leading-relaxed">
              In the event of a data breach that may affect your personal information, we will:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Notify affected users within 72 hours of discovering the breach</li>
              <li>Inform the Data Protection Board of India as required by DPDPA 2023</li>
              <li>Provide details about the nature of the breach and steps taken</li>
              <li>Recommend protective measures you should take</li>
            </ul>
          </section>

          {/* International Data Transfer */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. International Data Transfer</h2>
            <p className="text-gray-700 leading-relaxed">
              Our servers are hosted in Singapore (Railway cloud). While we primarily serve Indian users,
              data may be processed outside India. We ensure adequate safeguards are in place through:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Encryption of data at rest and in transit</li>
              <li>Compliance with DPDPA 2023 cross-border transfer requirements</li>
              <li>Contractual obligations with cloud providers</li>
            </ul>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Changes to Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal
              requirements. We will notify you of significant changes via email or platform notifications.
              Your continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Current Version:</strong> v1.0 (December 27, 2025)
            </p>
          </section>

          {/* Grievance Officer */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Grievance Officer (DPDPA Compliance)</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              As required by DPDPA 2023, we have appointed a Grievance Officer to address data protection concerns:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
              <p><strong>Name:</strong> [To be appointed]</p>
              <p className="mt-2"><strong>Email:</strong> grievance@mediquory-connect.com</p>
              <p className="mt-2"><strong>Response Time:</strong> Within 30 days of complaint receipt</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              For privacy-related questions, data requests, or concerns:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
              <p><strong>Email:</strong> support@mediquory-connect.com</p>
              <p className="mt-2"><strong>Privacy Requests:</strong> privacy@mediquory-connect.com</p>
              <p className="mt-2"><strong>Platform Support:</strong> Admin messaging (for registered users)</p>
              <p className="mt-2"><strong>Location:</strong> Kerala, India</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">Your Consent</h2>
            <p className="text-indigo-800 leading-relaxed">
              By using Mediquory Connect, you acknowledge that you have read and understood this Privacy Policy
              and consent to the collection, use, and processing of your personal data as described herein.
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6">
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Terms and Conditions
          </Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
