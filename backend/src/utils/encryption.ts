import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM mode
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * CRITICAL: Key must be 32 bytes (base64 encoded)
 * Generate with: openssl rand -base64 32
 * @returns Buffer containing the 32-byte encryption key
 * @throws Error if ENCRYPTION_KEY is not set or invalid
 */
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
      'Generate with: openssl rand -base64 32'
    );
  }

  try {
    const keyBuffer = Buffer.from(key, 'base64');

    if (keyBuffer.length !== 32) {
      throw new Error(
        `ENCRYPTION_KEY must be 32 bytes (256 bits), got ${keyBuffer.length} bytes. ` +
        'Generate with: openssl rand -base64 32'
      );
    }

    return keyBuffer;
  } catch (error) {
    throw new Error(
      'Invalid ENCRYPTION_KEY format. Must be base64 encoded. ' +
      'Generate with: openssl rand -base64 32'
    );
  }
};

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @returns Encrypted string in format: base64(iv + authTag + ciphertext)
 */
export const encrypt = (plaintext: string): string => {
  if (!plaintext || plaintext.trim() === '') return '';

  try {
    const key = getEncryptionKey();

    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // Get authentication tag (for GCM mode)
    const authTag = cipher.getAuthTag();

    // Combine: iv + authTag + encrypted data
    const combined = Buffer.concat([iv, authTag, encrypted]);

    // Return as base64 string
    return combined.toString('base64');
  } catch (error: any) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data encrypted with the encrypt function
 * @param encryptedData - Encrypted string (base64 encoded)
 * @returns Decrypted plaintext
 */
export const decrypt = (encryptedData: string): string => {
  if (!encryptedData || encryptedData.trim() === '') return '';

  try {
    const key = getEncryptionKey();

    // Decode from base64
    const buffer = Buffer.from(encryptedData, 'base64');

    // Extract components
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error: any) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data. Data may be corrupted or key is incorrect.');
  }
};

/**
 * Hash sensitive data (one-way, for comparison only)
 * Useful for data that doesn't need to be decrypted (like Aadhaar for verification)
 * @param data - The data to hash
 * @returns Hashed string
 */
export const hash = (data: string): string => {
  if (!data) return '';

  try {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hashedData = crypto.pbkdf2Sync(data, salt, 100000, KEY_LENGTH, 'sha512').toString('hex');
    return `${salt}:${hashedData}`;
  } catch (error: any) {
    console.error('Hashing error:', error.message);
    throw new Error('Failed to hash data');
  }
};

/**
 * Verify hashed data
 * @param data - Plain data to verify
 * @param hashedData - Hashed data in format: salt:hash
 * @returns true if data matches hash
 */
export const verifyHash = (data: string, hashedData: string): boolean => {
  if (!data || !hashedData) return false;

  try {
    const [salt, originalHash] = hashedData.split(':');
    const hash = crypto.pbkdf2Sync(data, salt, 100000, KEY_LENGTH, 'sha512').toString('hex');
    return hash === originalHash;
  } catch (error: any) {
    console.error('Hash verification error:', error.message);
    return false;
  }
};

/**
 * Mask sensitive data for display (e.g., Aadhaar number)
 * @param data - The data to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked string (e.g., "XXXX-XXXX-1234")
 */
export const maskData = (data: string, visibleChars: number = 4): string => {
  if (!data) return '';

  const dataStr = data.toString();
  if (dataStr.length <= visibleChars) return dataStr;

  const masked = 'X'.repeat(dataStr.length - visibleChars);
  const visible = dataStr.slice(-visibleChars);

  return `${masked}${visible}`;
};

/**
 * Mask Aadhaar number in standard format
 * @param aadhaar - 12-digit Aadhaar number
 * @returns Masked Aadhaar (e.g., "XXXX-XXXX-1234")
 */
export const maskAadhaar = (aadhaar: string): string => {
  if (!aadhaar) return '';

  const cleaned = aadhaar.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length !== 12) return maskData(aadhaar, 4);

  const masked = `XXXX-XXXX-${cleaned.slice(-4)}`;
  return masked;
};

/**
 * Mask phone number
 * @param phone - Phone number
 * @returns Masked phone (e.g., "XXXXXX1234")
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length < 4) return phone;

  return maskData(cleaned, 4);
};

/**
 * Create a SHA-256 hash of a value for searchability
 * Useful for searching encrypted fields
 * @param value - The value to hash
 * @returns Hex-encoded hash
 */
export const createSearchHash = (value: string): string => {
  if (!value || value.trim() === '') {
    return '';
  }

  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
};

/**
 * Encrypt an object's specified fields
 * @param obj - Object to encrypt
 * @param fields - Array of field names to encrypt
 * @returns New object with encrypted fields
 */
export const encryptFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T => {
  const result = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (value && typeof value === 'string') {
      result[field] = encrypt(value) as any;
    }
  }

  return result;
};

/**
 * Decrypt an object's specified fields
 * @param obj - Object to decrypt
 * @param fields - Array of field names to decrypt
 * @returns New object with decrypted fields
 */
export const decryptFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T => {
  const result = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (value && typeof value === 'string') {
      try {
        result[field] = decrypt(value) as any;
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error);
        result[field] = '[DECRYPTION_ERROR]' as any;
      }
    }
  }

  return result;
};

/**
 * Safely encrypt a value (returns null if input is null/undefined)
 * @param value - Value to encrypt
 * @returns Encrypted value or null
 */
export const safeEncrypt = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return encrypt(value);
};

/**
 * Safely decrypt a value (returns null if input is null/undefined)
 * @param value - Value to decrypt
 * @returns Decrypted value or null
 */
export const safeDecrypt = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    return decrypt(value);
  } catch (error) {
    console.error('Safe decrypt failed:', error);
    return '[DECRYPTION_ERROR]';
  }
};

// Test encryption on startup (validates key)
// Only test if ENCRYPTION_KEY is set (skip in development if not set yet)
if (process.env.ENCRYPTION_KEY) {
  try {
    const testValue = 'test-encryption-key-validation';
    const encrypted = encrypt(testValue);
    const decrypted = decrypt(encrypted);

    if (decrypted !== testValue) {
      throw new Error('Encryption test failed: decrypted value does not match original');
    }

    console.log('✅ Encryption utility initialized successfully');
  } catch (error) {
    console.error('❌ Encryption utility initialization failed:', error);
    console.error('⚠️  Please ensure ENCRYPTION_KEY is set correctly in environment variables');
    console.error('⚠️  Generate with: openssl rand -base64 32');
    process.exit(1); // Exit if encryption fails in production
  }
} else {
  console.warn('⚠️  ENCRYPTION_KEY not set - encryption functions will throw errors if used');
  console.warn('⚠️  Generate with: openssl rand -base64 32');
}
