import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024; // 15MB

// Cloudinary storage configuration for doctor KYC documents
const doctorKYCStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    let folder = 'mediquory/doctor-kyc/';

    if (file.fieldname === 'registrationCertificate') {
      folder += 'registration-certificates';
    } else if (file.fieldname === 'aadhaarFrontPhoto' || file.fieldname === 'aadhaarBackPhoto') {
      folder += 'aadhaar-photos';
    } else if (file.fieldname === 'profilePhoto') {
      folder += 'profile-photos';
    }

    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: folder,
      public_id: `${uniqueId}_${timestamp}`,
      resource_type: 'auto', // Automatically detect if it's image or raw (PDF)
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    };
  },
});

// File filter for doctor KYC documents
const doctorKYCFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Registration certificate can be PDF or image
  if (file.fieldname === 'registrationCertificate') {
    if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Registration certificate must be a PDF or image file (JPG, PNG)'));
    }
  }
  // Aadhaar and profile photos must be images
  else if (
    file.fieldname === 'aadhaarFrontPhoto' ||
    file.fieldname === 'aadhaarBackPhoto' ||
    file.fieldname === 'profilePhoto'
  ) {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`${file.fieldname} must be an image file (JPG, PNG)`));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

// Upload middleware for doctor signup
export const uploadDoctorKYC = multer({
  storage: doctorKYCStorage,
  fileFilter: doctorKYCFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).fields([
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'aadhaarFrontPhoto', maxCount: 1 },
  { name: 'aadhaarBackPhoto', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
]);

// Cloudinary storage for medical reports
const medicalReportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: 'mediquory/reports',
      public_id: `${uniqueId}_${timestamp}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    };
  },
});

// File filter for medical reports
const medicalReportFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Medical report must be a PDF or image file (JPG, PNG)'));
  }
};

// Upload middleware for medical reports
export const uploadMedicalReport = multer({
  storage: medicalReportStorage,
  fileFilter: medicalReportFileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
}).single('medicalReport');

// Cloudinary storage for payment proofs
const paymentProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: 'mediquory/payment-proofs',
      public_id: `payment_${uniqueId}_${timestamp}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png'],
    };
  },
});

// File filter for payment proofs
const paymentProofFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Payment proof must be an image file (JPG, PNG)'));
  }
};

// Upload middleware for payment proofs
export const uploadPaymentProof = multer({
  storage: paymentProofStorage,
  fileFilter: paymentProofFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single('paymentProof');

// Cloudinary storage for UPI QR codes
const qrCodeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: 'mediquory/qr-codes',
      public_id: `qr_${uniqueId}_${timestamp}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png'],
    };
  },
});

// Upload middleware for QR codes
export const uploadQRCode = multer({
  storage: qrCodeStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('QR code must be an image file (JPG, PNG)'));
    }
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single('qrCode');

// Cloudinary storage for patient medical files
const medicalFilesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: 'mediquory/medical-files',
      public_id: `${uniqueId}_${timestamp}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    };
  },
});

// Upload middleware for patient medical files
export const uploadMedicalFiles = multer({
  storage: medicalFilesStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File must be a PDF or image (JPG, PNG)'));
    }
  },
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
});

// Cloudinary storage for profile photo update (doctor only)
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: 'mediquory/doctor-kyc/profile-photos',
      public_id: `${uniqueId}_${timestamp}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png'],
    };
  },
});

// Upload middleware for profile photo update (doctor only)
export const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Profile photo must be an image file (JPG, PNG)'));
    }
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single('profilePhoto');

// Cloudinary storage for digital signature
const digitalSignatureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    return {
      folder: 'mediquory/doctor-kyc/signatures',
      public_id: `signature_${uniqueId}_${timestamp}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png'],
    };
  },
});

// Upload middleware for digital signature (doctor only)
export const uploadDigitalSignature = multer({
  storage: digitalSignatureStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Digital signature must be an image file (JPG, PNG)'));
    }
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single('signature');
