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
