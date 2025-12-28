# Mediquory Connect - Product Roadmap

**Last Updated:** December 28, 2025
**Status:** Post-RBAC Implementation

---

## ✅ Completed Features

### Phase 1A: Core Platform
- ✅ Doctor registration and KYC verification
- ✅ Patient self-registration via join links
- ✅ Video consultations (Agora.io)
- ✅ Prescription management
- ✅ Payment integration (Razorpay)
- ✅ Subscription system (Trial, Basic, Professional, Enterprise)
- ✅ Admin panel for doctor management
- ✅ Waitlist system for patient limits
- ✅ Medicine database and prescribing

### Phase 1B: RBAC & Security
- ✅ Role-Based Access Control (SUPER_ADMIN, ADMIN)
- ✅ Admin management (create, edit, deactivate admins)
- ✅ Granular permissions system
- ✅ Contextual data access (Aadhaar/UPI reveal)
- ✅ Audit logging (admin actions, patient activity)
- ✅ Rate limiting and API security
- ✅ Doctor profile photo upload
- ✅ Railway deployment configuration

---

## 🎯 Planned Features (Excluding Referral Program)

### 1. Admin Management Features (RBAC Enhancements)
**Priority:** Medium
**Impact:** Internal operations efficiency

- [ ] Admin account settings (change own password, email, 2FA setup)
- [ ] Admin activity dashboard (real-time actions, login history)
- [ ] Bulk admin operations (activate/deactivate multiple admins)
- [ ] Admin role templates (predefined permission sets)
- [ ] Admin session management (view active sessions, force logout)
- [ ] IP whitelisting for admin access

---

### 2. Doctor Verification Flow Improvements
**Priority:** High
**Impact:** Better doctor onboarding experience

- [ ] Email notifications when verification status changes (approved/rejected)
- [ ] Rejection reasons/feedback system (admin provides detailed feedback)
- [ ] Re-submission workflow for rejected doctors
- [ ] Verification status tracking (timeline view)
- [ ] Document verification checklist (mark each document as verified)
- [ ] Bulk doctor verification (approve/reject multiple at once)

---

### 3. Patient Management Enhancements
**Priority:** High
**Impact:** Doctor productivity, better patient organization

- [ ] Bulk patient import (CSV upload for doctors to import existing patients)
- [ ] Advanced patient search/filter (by name, phone, age, gender, registration date)
- [ ] Patient tags/categories (e.g., "diabetic", "hypertensive", "pregnant")
- [ ] Patient notes (private notes only visible to doctor)
- [ ] Export patient list to CSV/Excel
- [ ] Patient merge (combine duplicate patient records)
- [ ] Patient archival (soft delete inactive patients)
- [ ] Patient relationship (family members linked together)

---

### 4. Prescription & Medical Records
**Priority:** High
**Impact:** Doctor efficiency, patient care quality

- [ ] Prescription templates for common conditions
  - Pre-filled medicine lists for diabetes, hypertension, etc.
  - Quick insert buttons for common prescriptions

- [ ] Medical record attachments
  - Lab reports (PDF, images)
  - X-rays, CT scans, MRI uploads
  - Previous prescriptions from other doctors

- [ ] Prescription history export
  - Download all prescriptions for a patient as PDF
  - Email prescription to patient

- [ ] Digital signature for prescriptions
  - Doctor signature upload
  - Auto-add signature to all prescriptions

- [ ] Follow-up reminders
  - Set follow-up date when creating prescription
  - Automatic notification to patient

- [ ] Medication interaction warnings
  - Check for drug interactions when prescribing
  - Allergy warnings

---

### 5. Payment & Billing
**Priority:** Medium
**Impact:** Financial transparency, compliance

- [ ] Payment history and receipts
  - Detailed payment logs for doctors
  - Downloadable receipts for patients

- [ ] Refund management
  - Admin can process refunds
  - Automatic refund for cancelled consultations

- [ ] Invoice generation
  - Auto-generate invoices for doctor subscriptions
  - GST-compliant invoices

- [ ] Payment analytics dashboard
  - Revenue by doctor, by plan, by time period
  - Payment success/failure rates
  - Outstanding payments tracking

---

### 6. Analytics & Reporting ⭐ (HIGH BUSINESS VALUE)
**Priority:** Very High
**Impact:** Data-driven decisions, platform optimization

#### Doctor Analytics
- [ ] Performance metrics
  - Consultations per day/week/month
  - Average consultation duration
  - Patient satisfaction scores
  - Revenue generated

- [ ] Patient engagement
  - New patients vs returning patients
  - Consultation frequency
  - No-show rates

- [ ] Time-based analysis
  - Peak consultation hours
  - Busy days of week
  - Seasonal trends

#### Platform Analytics (Admin Dashboard)
- [ ] Revenue analytics
  - Total revenue by time period
  - Revenue by subscription tier
  - Revenue by doctor
  - Subscription conversion funnel

- [ ] User growth
  - New doctor registrations (by week/month)
  - Patient growth rate
  - Active users vs total users

- [ ] Subscription insights
  - Trial to paid conversion rate
  - Churn rate by tier
  - Average subscription lifetime
  - Upgrade/downgrade patterns

- [ ] Consultation metrics
  - Total consultations platform-wide
  - Video minutes consumed
  - Average consultation rating
  - Cancellation rates

#### Export & Reporting
- [ ] Custom date range reports
- [ ] Export to CSV/Excel/PDF
- [ ] Scheduled email reports (weekly/monthly)
- [ ] Comparison charts (this month vs last month)

---

### 7. Notifications System ⭐ (HIGH USER ENGAGEMENT)
**Priority:** Very High
**Impact:** User retention, appointment adherence

#### Email Notifications
- [ ] Appointment reminders (24 hours before, 1 hour before)
- [ ] Prescription ready notification
- [ ] Doctor verification status updates
- [ ] Subscription expiry warnings (7 days, 1 day before)
- [ ] Payment receipt emails
- [ ] New patient registration (notify doctor)
- [ ] Consultation request (notify doctor)

#### SMS Notifications (Twilio/AWS SNS)
- [ ] Appointment confirmation SMS
- [ ] Appointment reminder SMS (1 hour before)
- [ ] OTP for login/verification
- [ ] Prescription ready SMS with download link

#### In-App Notifications
- [ ] Real-time notification bell icon
- [ ] Notification preferences page
  - Choose which notifications to receive (email/SMS/in-app)
  - Set quiet hours

- [ ] Notification history
  - View all past notifications
  - Mark as read/unread
  - Delete notifications

---

### 8. Video Consultation Improvements
**Priority:** Medium
**Impact:** Better consultation experience

- [ ] Consultation recording (if legal/permitted)
  - Auto-record consultations
  - Store recordings securely
  - Patient access to own recordings

- [ ] Screen sharing
  - Doctor can share screen to show reports/diagrams

- [ ] Waiting room for patients
  - Virtual waiting room before doctor joins
  - Estimated wait time display

- [ ] Consultation quality feedback
  - Post-consultation rating (1-5 stars)
  - Written feedback option
  - Video/audio quality rating

- [ ] Connection quality indicator
  - Show network strength
  - Auto-switch to lower quality if poor connection

- [ ] Chat during consultation
  - Text chat alongside video
  - Share links, images during call

---

### 9. Search & Discovery (Patient Portal)
**Priority:** Medium
**Impact:** Patient acquisition, doctor visibility

- [ ] Advanced doctor search
  - Filter by specialization
  - Filter by rating (4+ stars, 5 stars)
  - Filter by availability (available today, this week)
  - Filter by location (future: add doctor location)
  - Sort by: rating, experience, price, availability

- [ ] Doctor availability calendar
  - Public view of doctor's available slots
  - Book appointment directly from calendar

- [ ] Enhanced doctor profiles
  - Professional bio
  - Years of experience
  - Medical qualifications (MBBS, MD, etc.)
  - Specializations and sub-specializations
  - Languages spoken
  - Consultation fees
  - Average rating and review count

- [ ] Doctor reviews & ratings
  - Verified patient reviews only
  - Star rating breakdown (5★: 80%, 4★: 15%, etc.)
  - Most helpful reviews first

- [ ] Featured doctors
  - Admin can feature top doctors
  - Highlight doctors with special expertise

---

### 10. Security Enhancements
**Priority:** High
**Impact:** Platform security, compliance

- [ ] Two-Factor Authentication (2FA)
  - TOTP-based 2FA for admins (Google Authenticator)
  - Optional 2FA for doctors
  - Backup codes generation

- [ ] Session Management
  - View all active sessions (device, location, IP)
  - Logout from specific device
  - "Logout from all devices" option
  - Session timeout after inactivity

- [ ] IP Whitelisting (Admin Panel)
  - Restrict admin access to specific IPs
  - Office IP whitelist
  - VPN requirement for remote access

- [ ] Audit Log Enhancements
  - Export audit logs to CSV/JSON
  - Audit log retention policy (archive after 1 year)
  - Audit log search and filters
  - Suspicious activity alerts

- [ ] Password Security
  - Password strength meter
  - Password history (prevent reuse of last 5 passwords)
  - Force password change every 90 days (admins)
  - Account lockout after 5 failed login attempts

- [ ] Data Encryption
  - Encrypt sensitive data at rest (Aadhaar, UPI)
  - End-to-end encryption for medical records
  - Secure file upload (virus scanning)

---

### 11. Communication Tools
**Priority:** Medium
**Impact:** Doctor-patient relationship

- [ ] In-app messaging
  - Secure messaging between doctor and patient
  - Message history
  - Read receipts
  - Typing indicators

- [ ] Appointment scheduling
  - Patient can request appointment time
  - Doctor can accept/reject/reschedule
  - Calendar integration (Google Calendar, iCal)

- [ ] Bulk messaging
  - Doctor can send message to all patients
  - Message templates (appointment reminders, health tips)
  - Schedule messages for later

---

### 12. Prescription Enhancements
**Priority:** Medium
**Impact:** Doctor productivity

- [ ] Voice-to-text prescription
  - Dictate prescription instead of typing
  - AI-powered medicine recognition

- [ ] Smart medicine search
  - Auto-suggest as you type
  - Show alternative medicines (generics)
  - Show medicine information (uses, side effects)

- [ ] Prescription analytics (for doctor)
  - Most prescribed medicines
  - Average medicines per prescription
  - Prescription trends over time

- [ ] Lab test orders
  - Order lab tests alongside prescription
  - Integration with lab partners (future)
  - Track lab test results

---

### 13. Mobile App (Future)
**Priority:** Low (After web is stable)
**Impact:** Wider reach, better UX

- [ ] Patient mobile app (React Native)
- [ ] Doctor mobile app (React Native)
- [ ] Push notifications
- [ ] Offline prescription viewing
- [ ] Camera integration (upload photos)

---

### 14. Multi-language Support
**Priority:** Low
**Impact:** Wider audience reach

- [ ] Hindi translation
- [ ] Regional languages (Tamil, Telugu, Bengali, Marathi)
- [ ] Language switcher in UI
- [ ] Localized date/time formats

---

### 15. Compliance & Legal
**Priority:** Medium
**Impact:** Legal protection, trust

- [ ] Terms of Service acceptance tracking
- [ ] Privacy Policy acceptance tracking
- [ ] HIPAA compliance (if targeting US)
- [ ] GDPR compliance (data export, right to be forgotten)
- [ ] Medical disclaimer on prescriptions
- [ ] E-prescription compliance (Digital Signature Certificate)

---

## 📊 Recommended Implementation Order

### Immediate Next (Post-RBAC)
1. **Analytics & Reporting** - Understand your platform usage
2. **Notifications System** - Improve user engagement
3. **Prescription Templates** - Quick win for doctor productivity

### Short-term (1-2 months)
4. **Payment Analytics** - Revenue insights
5. **Doctor Verification Improvements** - Better onboarding
6. **Patient Management Enhancements** - Doctor productivity

### Medium-term (3-6 months)
7. **Search & Discovery** - Patient acquisition
8. **Security Enhancements (2FA)** - Platform security
9. **Communication Tools** - User engagement
10. **Video Consultation Improvements** - Better UX

### Long-term (6+ months)
11. **Mobile App** - Platform expansion
12. **Multi-language Support** - Market expansion
13. **Advanced Analytics** - AI/ML insights

---

## 🔧 Technical Debt & Improvements

### Code Quality
- [ ] Add comprehensive unit tests (Jest)
- [ ] Add integration tests (Supertest)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Code coverage > 80%
- [ ] ESLint strict mode
- [ ] Prettier formatting

### Performance
- [ ] Database query optimization (add indexes)
- [ ] API response caching (Redis)
- [ ] Image optimization (Next.js Image)
- [ ] Code splitting (lazy loading)
- [ ] CDN for static assets

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing on PR
- [ ] Staging environment
- [ ] Database backups (automated)
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guides (for doctors, patients, admins)
- [ ] Developer documentation
- [ ] Architecture diagrams
- [ ] Deployment guide

---

## 📝 Notes

- **Referral Program:** Excluded from this roadmap as per user request
- **Priority levels:** Very High > High > Medium > Low
- **Impact:** Measured by user value and business metrics
- **Timeline:** Flexible based on team capacity and priorities

---

*Last reviewed: December 28, 2025*
