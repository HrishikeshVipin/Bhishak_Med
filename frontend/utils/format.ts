/**
 * Utility functions for formatting data
 */

/**
 * Adds "Dr." prefix to a doctor's name if it doesn't already have it
 * @param name The doctor's full name
 * @returns The name with "Dr." prefix
 */
export function formatDoctorName(name: string): string {
  if (!name) return '';

  // Check if name already starts with "Dr." or "Dr " (case insensitive)
  const trimmedName = name.trim();
  if (
    trimmedName.toLowerCase().startsWith('dr.') ||
    trimmedName.toLowerCase().startsWith('dr ')
  ) {
    return trimmedName;
  }

  return `Dr. ${trimmedName}`;
}

/**
 * Formats an image URL - handles both Cloudinary URLs and local file paths
 * @param imagePath The image path (can be a full URL or relative path)
 * @returns The complete image URL
 */
export function formatImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';

  // If it's already a full URL (Cloudinary), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Otherwise, it's a local file path - prepend the API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${apiUrl}/${imagePath.replace(/\\/g, '/')}`;
}
