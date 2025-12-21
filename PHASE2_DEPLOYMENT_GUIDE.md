# 🚀 Bhishak Med - Phase 2 Deployment Guide

## ✅ What's Been Built (So Far)

### Backend Features Completed:
1. **Patient OTP Authentication System**
   - SMS OTP via Twilio (6-digit, 10-min expiry)
   - Rate limiting (max 3 OTPs/hour)
   - Signup with phone + OTP + 6-digit PIN
   - Login with phone + PIN (no OTP needed after first signup)
   - JWT authentication with refresh tokens
   - Profile management

2. **Doctor Discovery System**
   - Public doctor search (by name, specialization, type, rating, fees)
   - Filter by online status
   - Public doctor profiles with reviews
   - Rating distribution display
   - Specialization autocomplete API

3. **Database Schema Updates**
   - Patient OTP storage
   - Patient authentication fields (phone verified, PIN, account type)
   - Doctor discovery fields (type, languages, experience, fees, bio)
   - Online status tracking (isOnline, lastSeen)
   - Aggregated ratings (totalReviews, averageRating)
   - Appointment scheduling models
   - Medicine reminder models
   - Referral system models

### Frontend Features Completed:
- ✅ UI Fix: Subscription tier display
- ✅ UI Fix: Notification dropdown mobile overflow

---

## 🔧 Railway Environment Variables

Add these to your Railway backend service:

### Existing Variables (Keep as is):
- `DATABASE_URL`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `FRONTEND_URL`
- `NODE_ENV`

### New Variables to Add:

```env
# Twilio SMS (for OTP)
TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Your Twilio US Number with +1 prefix>

# JWT Refresh Token Secret (generate a random string)
JWT_REFRESH_SECRET=<generate-secure-random-string-here>
```

### Generate JWT_REFRESH_SECRET:
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📱 Twilio Setup (Free Tier)

1. **Get a Phone Number**:
   - Go to https://console.twilio.com/
   - Navigate to Phone Numbers → Buy a Number
   - Select a US number (free on trial)
   - Copy the number with +1 prefix (e.g., +15551234567)

2. **Verify Test Numbers** (Free Tier Limitation):
   - Go to Phone Numbers → Verified Caller IDs
   - Add your test phone numbers (including +91 Indian numbers)
   - Twilio will send a verification code to each number
   - You can only send SMS to verified numbers in trial mode

3. **Production Mode** (When ready):
   - Upgrade to paid account
   - Can send to any phone number worldwide
   - ~$0.0075 per SMS

---

## 🗄️ Database Migration

When you push to GitHub and Railway auto-deploys, run this command in Railway terminal:

```bash
npx prisma migrate deploy
```

Or use Railway's run command feature to execute:
```bash
npm run prisma:migrate
```

**Expected Changes**:
- Patient table: New auth fields (phoneVerified, password, accountType, etc.)
- Doctor table: New discovery fields (doctorType, isOnline, averageRating, etc.)
- New tables: PatientOtp, Appointment, MedicineReminder, MedicineAdherenceLog, Referral, ReferralIncentive

---

## 🧪 Testing the APIs

### 1. Test Patient Signup Flow

**Step 1: Send OTP**
```http
POST https://your-railway-backend.up.railway.app/api/patient-auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your phone"
}
```

**In Development**: Check backend logs for OTP (not sent via SMS)
**In Production**: OTP sent to verified Twilio phone numbers only

**Step 2: Verify OTP**
```http
POST https://your-railway-backend.up.railway.app/api/patient-auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Step 3: Complete Signup**
```http
POST https://your-railway-backend.up.railway.app/api/patient-auth/signup
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456",
  "fullName": "Test Patient",
  "age": 30,
  "gender": "Male",
  "pin": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "patient": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Step 4: Login (Future visits)**
```http
POST https://your-railway-backend.up.railway.app/api/patient-auth/login
Content-Type: application/json

{
  "phone": "9876543210",
  "pin": "123456"
}
```

### 2. Test Doctor Discovery

**Search Doctors:**
```http
GET https://your-railway-backend.up.railway.app/api/doctors/search?doctorType=ALLOPATHY&isOnline=true&sortBy=rating
```

**Get Public Profile:**
```http
GET https://your-railway-backend.up.railway.app/api/doctors/{doctorId}/public
```

**Get Specializations:**
```http
GET https://your-railway-backend.up.railway.app/api/doctors/specializations
```

---

## 🔍 Current Limitations & Notes

### Patient Registration:
- Self-registered patients have `doctorId = null` initially
- They will be linked to a doctor when they book their first consultation
- Account type: `APP_ACCOUNT` (vs. `LINK_BASED` for doctor-created patients)

### Twilio Free Tier:
- Can only send SMS to verified phone numbers
- Trial account watermark in SMS: "Sent from your Twilio trial account"
- Upgrade to paid for production use

### Doctor Types:
- Only 3 types supported: ALLOPATHY, AYURVEDA, HOMEOPATHY
- This is a business requirement from the user

---

## 📋 What's Next

### Immediate (This Session):
- [ ] Create patient signup/login frontend pages
- [ ] Create patient dashboard page
- [ ] Create doctor search page for patients
- [ ] Implement online status tracking with Socket.io
- [ ] Enhance review aggregation

### Phase 2B (Future):
- [ ] Appointment scheduling system
- [ ] Medicine reminder notifications
- [ ] Referral system with credits
- [ ] Frontend pages for all above features

---

## 🐛 Troubleshooting

### "Authentication failed against database":
- Database credentials changed or Railway service restarted
- Check `DATABASE_URL` in Railway environment variables

### "Failed to send OTP":
- Check Twilio credentials are correct
- Ensure `NODE_ENV=production` in Railway
- In development, OTPs are logged to console (not sent via SMS)

### "Too many OTP requests":
- Rate limit: 3 OTPs per hour per phone number
- Wait 1 hour or manually delete from `PatientOtp` table

### "Prisma Client not generated":
- Run `npx prisma generate` in Railway terminal
- Or add to `package.json` postinstall script

---

## 📞 API Endpoints Summary

### Patient Auth (`/api/patient-auth/*`):
- `POST /send-otp` - Send OTP to phone
- `POST /verify-otp` - Verify OTP (returns success/failure)
- `POST /signup` - Create account with OTP + PIN
- `POST /login` - Login with phone + PIN
- `POST /refresh` - Refresh access token
- `GET /profile` - Get patient profile (authenticated)
- `PUT /profile` - Update patient profile (authenticated)
- `POST /change-pin` - Change PIN (authenticated)

### Doctor Discovery (`/api/doctors/*`):
- `GET /search` - Search doctors with filters
- `GET /specializations` - Get all specializations
- `GET /:doctorId/public` - Get public doctor profile
- `POST /online-status` - Update online status (doctor auth)
- `PUT /profile` - Update doctor profile (doctor auth)

---

## ✅ Pre-Deployment Checklist

- [ ] Add Twilio environment variables to Railway
- [ ] Generate and add `JWT_REFRESH_SECRET` to Railway
- [ ] Get Twilio phone number and add to `TWILIO_PHONE_NUMBER`
- [ ] Verify test phone numbers in Twilio console (for trial mode)
- [ ] Push code to GitHub
- [ ] Wait for Railway auto-deployment
- [ ] Run `npx prisma migrate deploy` in Railway terminal
- [ ] Test patient signup flow with verified phone number
- [ ] Test doctor search APIs
- [ ] Check backend logs for any errors

---

**Status**: Backend foundation complete. Frontend implementation in progress.

**Estimated Time to Full Phase 2A**: ~20 hours remaining (frontend pages + online status tracking)

---

*Generated on: 2025-12-21*
