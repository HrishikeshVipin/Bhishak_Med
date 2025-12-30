# File Upload System - Important Notice

## Current Implementation (Temporary Fix)

### Status: ✅ Working (with limitations)

The application now creates all required upload directories at startup, fixing the immediate 500 error. File uploads work correctly.

### Upload Directories Created:
```
uploads/
├── doctor-kyc/
│   ├── registration-certificates/
│   ├── aadhaar-photos/
│   └── profile-photos/
├── reports/
├── payment-proofs/
├── qr-codes/
└── medical-files/
```

---

## ⚠️ CRITICAL LIMITATION: Railway Ephemeral Filesystem

### The Problem:
Railway's containers use **ephemeral storage** - any files uploaded are stored temporarily and **will be DELETED** when:
- The application restarts
- A new deployment happens
- The container is rebuilt
- Railway scales or migrates the service

### What This Means:
- ❌ Uploaded files (medical reports, payment proofs, QR codes, etc.) are **NOT PERMANENT**
- ❌ Files will be lost on every deployment
- ❌ Not suitable for production use

---

## 🚀 Recommended Production Solution: Cloud Storage

For production deployment, you **MUST** migrate to cloud storage. Here are the recommended options:

### Option 1: AWS S3 (Most Popular)
**Pros:**
- Industry standard
- Extremely reliable (99.999999999% durability)
- Low cost (~$0.023/GB/month)
- Built-in CDN integration (CloudFront)
- Secure access controls

**Implementation:**
- Install: `npm install @aws-sdk/client-s3 multer-s3`
- Replace `multer.diskStorage()` with `multerS3()`
- Set environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`
- Files accessible via permanent URLs

**Cost Estimate:**
- Storage: $0.023/GB/month
- First 100GB transfer: Free
- 10,000 requests: $0.04

---

### Option 2: Cloudinary (Easiest)
**Pros:**
- Free tier: 25GB storage, 25GB bandwidth/month
- Automatic image optimization
- Built-in transformations (resize, crop, watermark)
- Simple setup

**Implementation:**
- Install: `npm install cloudinary multer-storage-cloudinary`
- Replace storage configuration
- Set: `CLOUDINARY_URL=cloudinary://key:secret@cloud_name`

**Cost:**
- Free: 25GB storage + 25GB bandwidth
- Paid: Starts at $99/month

---

### Option 3: ImageKit (Best for Medical Images)
**Pros:**
- Free tier: 20GB storage, 20GB bandwidth/month
- Real-time image/PDF optimization
- HIPAA-compliant tier available
- Fast CDN delivery

**Implementation:**
- Install: `npm install imagekit`
- Update multer to upload to ImageKit
- Set: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`

**Cost:**
- Free: 20GB storage + 20GB bandwidth
- Growth: $49/month

---

### Option 4: Railway Volumes (Not Recommended for Uploads)
**Pros:**
- Native Railway feature
- Persistent storage

**Cons:**
- ❌ Not designed for user uploads
- ❌ No CDN/fast delivery
- ❌ Expensive ($1/GB/month)
- ❌ Requires manual backup strategy
- ❌ Difficult to scale

**Use Case:** Databases, cache, not for file uploads

---

## Migration Steps (When Ready)

### Phase 1: Choose Provider
1. Evaluate options based on:
   - Budget
   - Expected upload volume
   - Compliance requirements (HIPAA for medical data)
   - Technical complexity

### Phase 2: Update Code
1. Install cloud storage SDK
2. Update `backend/src/middleware/upload.ts`:
   ```typescript
   // BEFORE (current)
   const storage = multer.diskStorage({
     destination: 'uploads/medical-files',
     filename: (req, file, cb) => { ... }
   });

   // AFTER (example with S3)
   import multerS3 from 'multer-s3';
   import { S3Client } from '@aws-sdk/client-s3';

   const s3 = new S3Client({
     region: process.env.AWS_REGION,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     }
   });

   const storage = multerS3({
     s3: s3,
     bucket: process.env.AWS_BUCKET_NAME,
     key: (req, file, cb) => {
       const uniqueId = uuidv4();
       const timestamp = Date.now();
       cb(null, `medical-files/${uniqueId}_${timestamp}_${file.originalname}`);
     }
   });
   ```

3. Update database schema to store cloud URLs instead of local paths
4. Update file serving endpoints to redirect to cloud URLs

### Phase 3: Migration Script
1. If you have existing files, create migration script to upload to cloud
2. Update database URLs
3. Verify all files accessible

### Phase 4: Deploy
1. Set environment variables in Railway
2. Deploy updated code
3. Test file uploads
4. Remove local uploads directory code

---

## Temporary Workaround (Current Setup)

### What Works Now:
- ✅ File uploads succeed (no more 500 errors)
- ✅ Files accessible during current session
- ✅ Suitable for development/testing

### What Doesn't Work:
- ❌ Files persist across deployments
- ❌ Files available after restart
- ❌ Production-ready storage

### When to Migrate:
- Before going live with real patients
- Before doctor KYC verification starts
- Before any critical data uploads

---

## Cost Comparison for 100 Active Doctors

Assuming each doctor:
- Uploads 100 patient files/month (5MB each) = 50GB
- Each file accessed 3 times (reports, prescriptions)

### Railway Volumes
- Storage: 50GB × $1/GB = **$50/month**
- No bandwidth cost
- **Total: $50/month**

### AWS S3
- Storage: 50GB × $0.023/GB = **$1.15/month**
- Transfer: 150GB × $0.09/GB = **$13.50/month**
- Requests: 300,000 × $0.04/10K = **$1.20/month**
- **Total: ~$16/month**

### Cloudinary (Paid)
- Storage + Bandwidth bundled
- **Total: $99/month** (unlimited requests)

### ImageKit (Free tier)
- If under 20GB: **$0/month**
- Growth plan: **$49/month**

**Recommendation:** Start with AWS S3 for best cost/performance ratio.

---

## Next Steps

1. **Immediate:** Current fix deployed, file uploads working ✅
2. **Before production:** Choose and implement cloud storage provider
3. **Optional:** Set up Railway cron job to clean uploads folder daily

---

Last Updated: December 30, 2025
Status: Temporary fix deployed, migration to cloud storage recommended before production launch
