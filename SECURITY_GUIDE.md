# 🔒 Mediquory Connect - Security Guide for Railway Deployment

**CRITICAL:** This application handles sensitive medical data. Follow ALL security measures below.

---

## ⚠️ **IMMEDIATE ACTIONS (Before Production)**

### 1. **Database Security**

#### ✅ Railway PostgreSQL Settings

**In Railway Dashboard:**
```
1. Go to your PostgreSQL service
2. Click "Settings" → "Networking"
3. ENABLE: "Private Networking" (restricts database access to Railway internal network)
4. Verify SSL/TLS is enabled (Railway does this by default)
```

**Connection String Security:**
```bash
# ✅ GOOD (Railway default - includes SSL)
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# ❌ BAD (No SSL)
DATABASE_URL=postgresql://user:pass@host:port/db
```

**Database Backups (CRITICAL):**
```
Railway → PostgreSQL Service → Settings → Backups
- Enable automatic daily backups
- Test restore process quarterly
- Store backup download links securely (encrypted password manager)
```

---

### 2. **Encryption at Rest**

#### ✅ Sensitive Fields to Encrypt

**Already Implemented:**
- ENCRYPTION_KEY in your .env encrypts sensitive data

**Fields That MUST Be Encrypted:**
```typescript
// Patient Data
- Phone numbers (if storing with country codes)
- Medical history
- Allergies
- Current medications

// Doctor Data
- UPI ID (partially visible)
- Bank details (if added)
- Phone numbers

// Consultation Data
- Chief complaint
- Doctor notes
- Prescription medications (drug names)
```

**Implementation Status Check:**
Currently, your app stores data in **plain text** in the database. We need to add encryption.

---

### 3. **Environment Variables Security**

#### ✅ Railway Environment Variables Setup

**In Railway Dashboard:**
```
1. Go to your Backend service
2. Click "Variables" tab
3. Add these variables (NEVER commit to git):

DATABASE_URL=<auto-provided-by-railway>
NODE_ENV=production
PORT=5000

# Generate with: openssl rand -base64 64
JWT_SECRET=<your-64-char-random-string>

# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=<your-32-char-random-string>

# Razorpay LIVE credentials
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=<secret>

# Agora Production
AGORA_APP_ID=<production-app-id>
AGORA_APP_CERTIFICATE=<production-cert>

# Frontend URL
FRONTEND_URL=https://mediquory-connect.up.railway.app
```

**Generate Secure Keys:**
```bash
# Run these commands and copy output to Railway:
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY
```

---

### 4. **HTTPS/SSL Enforcement**

#### ✅ Railway Automatic SSL

Railway provides automatic SSL certificates. Verify:
```
1. Railway Dashboard → Frontend Service → Settings
2. Check "Custom Domain" or "Railway Domain"
3. Ensure it shows "https://" (Railway auto-enables)
```

#### ✅ Force HTTPS Redirect

**Backend (already in place via Helmet):**
```typescript
// backend/src/server.ts
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Frontend (Next.js):**
```typescript
// Already handled by Railway + Next.js
// All traffic auto-redirected to HTTPS
```

---

### 5. **Access Control & Authentication**

#### ✅ Current Security Measures

**Already Implemented:**
- ✅ JWT tokens with 7-day expiry
- ✅ bcrypt password hashing (12 rounds)
- ✅ Cookie-based auth with HttpOnly flags
- ✅ Role-based access (DOCTOR, ADMIN, PATIENT)

**Additional Measures to Add:**

**A. Password Policy Enforcement:**
```typescript
// backend/src/middleware/passwordValidator.ts
export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    throw new Error('Password must contain uppercase, lowercase, and numbers');
  }
  return true;
};
```

**B. Rate Limiting (already implemented):**
```typescript
// ✅ Already in server.ts
app.use('/api', apiLimiter); // 100 requests per 15 minutes
```

**C. Session Management:**
```typescript
// Add session timeout
// Logout users after 7 days (JWT expiry)
// Clear cookies on logout
```

---

### 6. **Audit Logging**

#### ⚠️ CRITICAL: Track All Sensitive Operations

**Create Audit Log Table:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- DOCTOR, ADMIN, PATIENT
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```

**Log These Actions:**
- ✅ Login/Logout
- ✅ Prescription creation/download
- ✅ Patient data access
- ✅ Payment confirmations
- ✅ Consultation creation/completion
- ✅ Failed login attempts (security alert)

---

### 7. **Data Backup Strategy**

#### ✅ Railway Automated Backups

**Setup:**
```
1. Railway Dashboard → PostgreSQL → Settings
2. Enable "Automated Backups" (daily at 2 AM UTC)
3. Retention: 7 days minimum (Railway plan dependent)
```

**Manual Backups (Weekly):**
```bash
# Backup command (run locally via Railway CLI)
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Encrypt backup
openssl enc -aes-256-cbc -salt -in backup_20250127.sql -out backup_20250127.sql.enc

# Store in secure cloud storage (Google Drive with 2FA, Dropbox, etc.)
```

**Disaster Recovery Plan:**
```
1. Test restore process monthly
2. Document recovery steps
3. Store backup encryption keys separately (password manager)
4. Maintain 3-2-1 backup rule:
   - 3 copies of data
   - 2 different storage types (Railway + Cloud)
   - 1 offsite (Cloud storage)
```

---

### 8. **File Upload Security**

#### ✅ Current Implementation

**Already Secure:**
- ✅ Multer limits file size
- ✅ File type validation (images only)

**Additional Measures:**

**A. Virus Scanning (Optional but Recommended):**
```typescript
// Use ClamAV or third-party API
import { scanFile } from './virusScanner';

// Before saving file
await scanFile(file.path);
```

**B. Secure File Storage:**
```
Railway Volumes (Current) → Move to Railway S3-compatible storage or Cloudflare R2
- Prevents direct file access
- Better access control
- CDN delivery (faster)
```

**C. File Access Control:**
```typescript
// Verify user owns the file before serving
app.get('/uploads/:filename', authenticateUser, async (req, res) => {
  const file = await getFileMetadata(req.params.filename);
  if (file.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).send('Access denied');
  }
  res.sendFile(file.path);
});
```

---

### 9. **API Security**

#### ✅ Already Implemented

- ✅ CORS restrictions (specific origins only)
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Input validation (Zod schemas)

#### ⚠️ Add These

**A. API Request Validation:**
```typescript
// Sanitize all inputs
import sanitizeHtml from 'sanitize-html';

const sanitizeInput = (input: string) => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
};
```

**B. SQL Injection Protection:**
```typescript
// ✅ Already protected (using Prisma ORM)
// Prisma parameterizes all queries automatically
```

**C. XSS Protection:**
```typescript
// ✅ Already enabled via Helmet
// Add Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

---

### 10. **HIPAA Compliance Considerations**

**⚠️ IMPORTANT:** If operating in the US with US patients, you may need HIPAA compliance.

#### ✅ HIPAA Requirements

**Technical Safeguards:**
- ✅ Encryption in transit (HTTPS)
- ⚠️ Encryption at rest (needs implementation)
- ✅ Access controls (JWT, roles)
- ⚠️ Audit logging (needs implementation)
- ⚠️ Automatic logout (needs implementation)

**Administrative Safeguards:**
- ⚠️ Business Associate Agreement (BAA) with Railway
- ⚠️ Data breach response plan
- ⚠️ Employee training
- ⚠️ Privacy policy

**Physical Safeguards:**
- ✅ Railway handles data center security

**Note:** Railway does NOT currently offer HIPAA-compliant BAA. For full HIPAA compliance, consider:
- AWS (with BAA)
- Google Cloud (with BAA)
- Azure (with BAA)
- Specialized HIPAA-compliant hosting

---

### 11. **Monitoring & Alerts**

#### ✅ Setup in Railway

**Railway Logs:**
```
1. Railway Dashboard → Service → Deployments
2. Click "View Logs"
3. Monitor for:
   - Failed login attempts
   - 500 errors
   - Slow queries
   - Unusual traffic patterns
```

**Alert Setup:**
```
1. Railway → Settings → Integrations
2. Add Slack/Discord webhook
3. Alert on:
   - Service crashes
   - High error rates
   - Database connection failures
```

**Error Tracking (Recommended):**
```bash
# Add Sentry for error monitoring
npm install @sentry/node @sentry/nextjs

# Backend
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  beforeSend(event, hint) {
    // Filter sensitive data before sending
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  }
});
```

---

### 12. **Incident Response Plan**

#### ✅ Data Breach Protocol

**If Data Breach Occurs:**

**Immediate (0-1 hour):**
1. Isolate affected systems
2. Change all passwords/secrets
3. Notify Railway support
4. Review audit logs

**Short-term (1-24 hours):**
1. Assess breach scope
2. Identify compromised data
3. Notify affected users
4. Document timeline

**Long-term (24+ hours):**
1. Implement fixes
2. Strengthen security
3. Legal/regulatory compliance (GDPR, HIPAA, etc.)
4. Public disclosure if required by law

---

## 🔍 **Security Checklist for Production**

### Pre-Deployment

- [ ] All secrets generated with `openssl rand`
- [ ] No `.env` files committed to git
- [ ] Railway environment variables configured
- [ ] Database backups enabled (daily)
- [ ] SSL/HTTPS verified
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Password hashing verified (bcrypt 12 rounds)
- [ ] JWT expiry set (7 days max)

### Post-Deployment

- [ ] Test all authentication flows
- [ ] Verify prescription downloads (authorized users only)
- [ ] Test payment flows end-to-end
- [ ] Check audit logging (if implemented)
- [ ] Monitor error rates (first 48 hours)
- [ ] Test disaster recovery (restore from backup)
- [ ] Review Railway logs for anomalies
- [ ] Verify file upload restrictions
- [ ] Test session timeout

### Monthly Maintenance

- [ ] Review audit logs for suspicious activity
- [ ] Check failed login attempts
- [ ] Update dependencies (npm audit fix)
- [ ] Test backup restore process
- [ ] Review access control policies
- [ ] Check SSL certificate expiry (Railway auto-renews)
- [ ] Monitor database size/performance
- [ ] Review error logs in Sentry

### Quarterly

- [ ] Security audit (code review)
- [ ] Penetration testing (optional but recommended)
- [ ] Update privacy policy
- [ ] Review HIPAA compliance (if applicable)
- [ ] Disaster recovery drill
- [ ] User access review (remove inactive doctors/admins)

---

## 🚨 **Known Security Gaps & Recommended Fixes**

### HIGH PRIORITY

**1. Encryption at Rest (NOT IMPLEMENTED)**
```typescript
// Add field-level encryption for sensitive data
// Use ENCRYPTION_KEY from .env
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
};

export const decrypt = (encrypted: string): string => {
  const buffer = Buffer.from(encrypted, 'base64');
  const iv = buffer.slice(0, 16);
  const authTag = buffer.slice(16, 32);
  const data = buffer.slice(32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
};
```

**2. Audit Logging (NOT IMPLEMENTED)**
- See section 6 above for implementation

**3. Automatic Session Timeout (NOT IMPLEMENTED)**
```typescript
// Frontend: Auto-logout after 30 minutes of inactivity
let inactivityTimer;
const TIMEOUT = 30 * 60 * 1000; // 30 minutes

const resetTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    // Logout user
    authStore.logout();
    router.push('/login');
  }, TIMEOUT);
};

// Listen for user activity
document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);
```

### MEDIUM PRIORITY

**4. Password Policy Enforcement**
- Currently allows weak passwords
- Add validation (see section 5A)

**5. Two-Factor Authentication (2FA)**
- Highly recommended for doctor/admin accounts
- Use TOTP (Google Authenticator, Authy)

**6. File Storage Migration**
- Move from local uploads to secure cloud storage (S3, R2)

### LOW PRIORITY

**7. Content Security Policy (CSP)**
- Add stricter CSP headers (see section 9C)

**8. Subresource Integrity (SRI)**
- If using external CDNs for scripts/styles

---

## 📞 **Security Contacts**

**Railway Support:**
- Discord: https://discord.gg/railway
- Email: team@railway.app

**Security Resources:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- HIPAA Guidelines: https://www.hhs.gov/hipaa/index.html
- GDPR Compliance: https://gdpr.eu/

---

## 📝 **Legal Requirements**

### Required Documents

**1. Privacy Policy (REQUIRED):**
- Data collection practices
- Data storage location (Railway US/EU)
- Third-party services (Agora, Razorpay)
- User rights (access, deletion)
- Cookie usage

**2. Terms of Service (REQUIRED):**
- User responsibilities
- Service limitations
- Liability disclaimers
- Medical disclaimer (not a replacement for emergency care)

**3. Consent Forms:**
- Telemedicine consent
- Data processing consent (GDPR)
- Payment processing consent

**4. Data Retention Policy:**
- How long data is kept
- Deletion procedures
- User right to be forgotten

---

## 🔑 **Key Takeaways**

1. **✅ Railway provides good baseline security** (SSL, network isolation)
2. **⚠️ You must implement application-level security** (encryption, logging, backups)
3. **🚨 Regular monitoring and backups are CRITICAL** for medical data
4. **⚠️ HIPAA compliance requires additional infrastructure** (Railway doesn't offer BAA)
5. **✅ Follow the checklist above** before going to production

---

*Last Updated: January 2025*
*Review and update this guide quarterly*
