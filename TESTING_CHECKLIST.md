# 🧪 MEDIQUORY CONNECT - Complete Testing Checklist

**Last Updated:** January 3, 2026
**Environment:** Railway Production
**Status:** Ready for Testing

---

## 📋 Pre-Testing Setup

| #  | Task | Status | Notes |
|----|------|--------|-------|
| 1  | Railway Volume mounted at `/app/uploads` (5GB minimum) | ⬜ | CRITICAL: Without this, files will be deleted on redeploy |
| 2  | Delete all old Cloudinary patients | ⬜ | Fresh start - no backward compatibility |
| 3  | Backend deployed and running | ⬜ | Check Railway logs for errors |
| 4  | Frontend deployed and running | ⬜ | Check build status |
| 5  | Database migrations applied | ⬜ | Check Prisma migrations |

---

## 👨‍⚕️ ADMIN TESTS

### Admin Login
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| A1 | Login with admin credentials | Successfully logged in | ⬜ | |
| A2 | Dashboard loads | Shows stats and navigation | ⬜ | |
| A3 | Can access all admin sections | Doctors, Patients, Subscriptions | ⬜ | |

### Doctor Management
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| A4 | View pending doctor signups | List displayed | ⬜ | |
| A5 | Approve a doctor | Status changes to VERIFIED | ⬜ | |
| A6 | Reject a doctor | Status changes to REJECTED | ⬜ | |
| A7 | View doctor details | All KYC documents visible | ⬜ | |

### Subscription Management
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| A8 | View subscription plans | Plans displayed | ⬜ | |
| A9 | Edit subscription plan | Changes saved | ⬜ | |
| A10 | Assign plan to doctor | Doctor's plan updated | ⬜ | |

---

## 👨‍⚕️ DOCTOR TESTS

### Doctor Signup
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D1 | Fill signup form with all fields | Form validates | ⬜ | |
| D2 | Upload registration certificate | File uploaded | ⬜ | Check uploads/doctor-kyc/ |
| D3 | Upload Aadhaar photos (front & back) | Files uploaded | ⬜ | |
| D4 | Upload profile photo | File uploaded to uploads/profile-photos/ | ⬜ | NEW: Local storage |
| D5 | Submit signup | Pending approval message | ⬜ | |
| D6 | Try login before approval | Denied with pending message | ⬜ | |

### Doctor Login (After Approval)
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D7 | Login with approved credentials | Dashboard loads | ⬜ | |
| D8 | View subscription status | Shows current plan | ⬜ | |
| D9 | View patient limit | Shows remaining slots | ⬜ | |

### Profile Management
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D10 | Update bio | Saved successfully | ⬜ | |
| D11 | Upload new profile photo | Photo updated in uploads/profile-photos/ | ⬜ | NEW: Local storage |
| D12 | Upload digital signature (180×80px) | Signature uploaded to uploads/signatures/ | ⬜ | NEW: Local storage + size guide |
| D13 | View signature size guide | Shows pixels AND cm measurements | ⬜ | NEW: 4.8cm × 2.1cm |
| D14 | Signature persists after page refresh | Still visible | ⬜ | |
| D15 | Update UPI ID | Saved successfully | ⬜ | |
| D16 | Upload QR code | Uploaded successfully | ⬜ | |

### Patient Management
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D17 | Create new patient with details | Patient created | ⬜ | |
| D18 | View patient registration link | Link generated | ⬜ | |
| D19 | Copy patient link | Link copied to clipboard | ⬜ | |
| D20 | View patient list | All patients displayed | ⬜ | |
| D21 | Search for patient | Search works | ⬜ | |
| D22 | Filter by status (Active/Waitlisted) | Filters work | ⬜ | |

### Consultation Flow
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D23 | Click "Consult" on active patient | Consultation page loads | ⬜ | |
| D24 | View patient vitals | Vitals displayed if submitted | ⬜ | |
| D25 | View patient medical reports | Reports displayed if uploaded | ⬜ | NEW: From uploads/reports/ |
| D26 | Send chat message | Message appears | ⬜ | |
| D27 | Start video call | Video room opens | ⬜ | |
| D28 | Video call connects | Can see/hear patient | ⬜ | |
| D29 | End video call | Call ends gracefully | ⬜ | |

### Prescription Creation
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D30 | Fill prescription form | Form accepts input | ⬜ | |
| D31 | Add multiple medications | All added | ⬜ | |
| D32 | Submit prescription | PDF generated in uploads/prescriptions/ | ⬜ | NEW: Local storage |
| D33 | View prescription PDF | PDF opens with logo | ⬜ | NEW: Logo at top |
| D34 | Check signature in PDF | Signature visible (180×80px space) | ⬜ | NEW: Larger space |
| D35 | Download prescription BEFORE payment | Works (doctor can view anytime) | ⬜ | NEW: No payment needed |

### Payment Confirmation
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D36 | View payment proof from patient | Image displayed | ⬜ | |
| D37 | Confirm payment | Status updates | ⬜ | |
| D38 | Patient gets download popup | Socket event sent | ⬜ | NEW: Real-time popup |
| D39 | Consultation marked as completed | Status = COMPLETED | ⬜ | |

### History
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D40 | View consultation history | Past consultations listed | ⬜ | |
| D41 | Download old prescription | PDF downloads | ⬜ | From uploads/ |
| D42 | Prescription survives redeploy | Still accessible after Railway redeploy | ⬜ | Tests volume persistence |

---

## 🏥 PATIENT TESTS (Link-Based Access)

### Access Link
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P1 | Open patient link /p/{token} | Portal loads | ⬜ | |
| P2 | View doctor information | Doctor details displayed | ⬜ | |
| P3 | UI matches theme | Gradient background, glassmorphism header | ⬜ | NEW: Updated theme |

### Patient Registration
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P4 | Fill patient details form | Form accepts input | ⬜ | |
| P5 | Submit vitals | Vitals saved | ⬜ | |
| P6 | Upload medical report (PDF/Image) | File uploaded to uploads/reports/ | ⬜ | NEW: Local storage |
| P7 | Multiple reports uploaded | All saved | ⬜ | |

### Chat & Video
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P8 | Send chat message | Message appears | ⬜ | |
| P9 | Receive message from doctor | Appears in real-time | ⬜ | |
| P10 | Join video call (when doctor calls) | Video room opens | ⬜ | |
| P11 | Video/audio works | Can see/hear doctor | ⬜ | |
| P12 | Leave video call | Disconnects cleanly | ⬜ | |

### Payment Flow
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P13 | View payment section after prescription | UPI ID and QR code displayed | ⬜ | |
| P14 | Upload payment proof | Screenshot uploaded | ⬜ | |
| P15 | Payment submitted | Waiting for doctor confirmation | ⬜ | |

### NEW Workflow: Download After Payment
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P16 | Doctor confirms payment | Download popup appears automatically | ⬜ | NEW: Auto-popup |
| P17 | Popup shows "Payment Confirmed!" | Clear messaging | ⬜ | NEW |
| P18 | Click "Download Prescription" | PDF downloads from /uploads/ | ⬜ | NEW: Local file |
| P19 | Click "Skip" button | Popup closes, consultation ends | ⬜ | NEW |
| P20 | Can download later from history | Still accessible | ⬜ | NEW |

### Consultation History
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P21 | Click "Past Consultations" | Section expands | ⬜ | |
| P22 | View past consultation list | All completed consultations | ⬜ | |
| P23 | See diagnosis and medications | Data decrypted and displayed | ⬜ | |
| P24 | Download old prescription | PDF downloads successfully | ⬜ | |

### Consultation Complete State
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| P25 | After download/skip, see completion message | "Consultation Completed!" displayed | ⬜ | NEW |
| P26 | Download button in completion message | Scrolls to Past Consultations | ⬜ | NEW |
| P27 | Chat/video disabled after completion | Cannot send new messages | ⬜ | |

---

## 🏥 PATIENT TESTS (Authenticated Account)

### Patient Login
| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| PA1 | Login with patient credentials | Dashboard loads | ⬜ | For patients with accounts |
| PA2 | View consultation history | /patient/consultations | ⬜ | |
| PA3 | Download prescription | Works after payment confirmation | ⬜ | |

---

## 🔐 SECURITY TESTS

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| S1 | Try accessing doctor route as patient | Denied (403) | ⬜ | |
| S2 | Try accessing admin route as doctor | Denied (403) | ⬜ | |
| S3 | Try downloading prescription before payment (as patient) | Denied until doctor confirms | ⬜ | |
| S4 | Doctor can download anytime | Works even before payment | ⬜ | NEW |
| S5 | Files in /uploads/ not directly accessible | Must go through API | ⬜ | NEW: Volume security |
| S6 | Invalid patient token | Error page displayed | ⬜ | |
| S7 | Expired session | Redirected to login | ⬜ | |

---

## 📁 FILE STORAGE TESTS (CRITICAL)

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| F1 | Profile photo saved in uploads/profile-photos/ | File exists | ⬜ | NEW: Local storage |
| F2 | Digital signature saved in uploads/signatures/ | File exists | ⬜ | NEW: Local storage |
| F3 | Medical report saved in uploads/reports/ | File exists | ⬜ | NEW: Local storage |
| F4 | Prescription PDF saved in uploads/prescriptions/ | File exists | ⬜ | NEW: Local storage |
| F5 | Files persist after Railway redeploy | All files still accessible | ⬜ | CRITICAL: Tests volume |
| F6 | No Cloudinary URLs in database | All paths are relative (uploads/...) | ⬜ | NEW: Clean migration |

---

## 🎨 UI/UX TESTS

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| U1 | Logo appears on prescription PDF | Centered at top | ⬜ | NEW |
| U2 | Digital signature shows proper size | 180×80px space | ⬜ | NEW: 20% larger |
| U3 | Signature upload shows size guide | Pixels AND cm measurements | ⬜ | NEW |
| U4 | Patient portal matches theme | Gradient background | ⬜ | NEW |
| U5 | Glassmorphism effects visible | Header has blur effect | ⬜ | NEW |
| U6 | Gradient text on titles | Blue to cyan gradient | ⬜ | NEW |
| U7 | Download popup is senior-friendly | Large buttons, clear text | ⬜ | NEW |
| U8 | Loading states show properly | Spinners during async operations | ⬜ | |
| U9 | Responsive on mobile | Works on phone screens | ⬜ | |

---

## ⚡ PERFORMANCE TESTS

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| PR1 | PDF generation time | < 3 seconds | ⬜ | With signature |
| PR2 | Image upload time | < 5 seconds | ⬜ | To local volume |
| PR3 | File download speed | Fast (local serving) | ⬜ | Should be faster than Cloudinary |
| PR4 | Chat message latency | < 500ms | ⬜ | Socket.io real-time |
| PR5 | Video call quality | Smooth, low latency | ⬜ | |

---

## 🐛 ERROR HANDLING TESTS

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| E1 | Upload oversized file (>10MB) | Error message displayed | ⬜ | |
| E2 | Upload invalid file type | Rejected with message | ⬜ | |
| E3 | Network error during upload | Graceful error message | ⬜ | |
| E4 | Missing required form fields | Validation errors shown | ⬜ | |
| E5 | Invalid patient token | Clear error page | ⬜ | |
| E6 | Socket disconnection | Auto-reconnect | ⬜ | |

---

## 📊 DATA INTEGRITY TESTS

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| D1 | Prescription data encrypted | Diagnosis, medications encrypted in DB | ⬜ | |
| D2 | Decryption works correctly | Data readable in consultation | ⬜ | |
| D3 | Old prescriptions still accessible | After 1 week+ | ⬜ | |
| D4 | Patient count accurate | Matches actual patients created | ⬜ | |
| D5 | Video minutes tracking | Accurately tracked | ⬜ | |

---

## 🚀 DEPLOYMENT TESTS

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| DP1 | Push code to GitHub | Triggers Railway deployment | ⬜ | |
| DP2 | Backend builds successfully | No build errors | ⬜ | |
| DP3 | Frontend builds successfully | No build errors | ⬜ | |
| DP4 | Database migrations run | Schema up to date | ⬜ | |
| DP5 | Environment variables set | All required vars present | ⬜ | |
| DP6 | Files persist after redeploy | Volume working correctly | ⬜ | CRITICAL |

---

## 🔄 REGRESSION TESTS (Old Features)

| #  | Test | Expected Result | Status | Notes |
|----|------|----------------|--------|-------|
| R1 | Waitlist system works | Waitlisted patients have limited access | ⬜ | |
| R2 | Trial subscription (2 patients) | Limits enforced | ⬜ | |
| R3 | Subscription upgrade | Plan changes applied | ⬜ | |
| R4 | Notification system | Unread counts work | ⬜ | |
| R5 | Real-time presence | Online/offline status | ⬜ | |

---

## ✅ FINAL CHECKLIST

| #  | Test | Status | Notes |
|----|------|--------|-------|
| 1  | All CRITICAL tests passed | ⬜ | Volume, file storage, redeploy |
| 2  | All HIGH priority tests passed | ⬜ | Authentication, payments, prescriptions |
| 3  | No console errors | ⬜ | Check browser and server logs |
| 4  | No broken images/files | ⬜ | All uploads display correctly |
| 5  | Ready for production use | ⬜ | Final sign-off |

---

## 📝 NOTES & ISSUES

| Issue # | Description | Severity | Status | Resolution |
|---------|-------------|----------|--------|------------|
| | | | | |
| | | | | |

---

## 🎯 TESTING PRIORITY

**CRITICAL** (Must Pass):
- F5: Files persist after redeploy (volume test)
- D35: Doctor can download prescription before payment
- P18: Patient download after payment works
- S5: Upload files not directly accessible

**HIGH** (Should Pass):
- All prescription workflow tests (D30-D39, P13-P20)
- All file storage tests (F1-F6)
- Security tests (S1-S7)

**MEDIUM** (Nice to Have):
- UI/UX improvements
- Performance optimizations
- Error handling edge cases

---

**Testing Environment:** https://mediquory-connect.up.railway.app
**Admin Login:** admin@bhishakmed.com / admin123
**Test Doctor:** doctor@test.com / doctor123

**🔴 IMPORTANT: Test file persistence after Railway redeploy!**
