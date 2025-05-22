/**
 * Task Utility Functions
 * 
 * A collection of utility functions for task-related operations:
 * - Time formatting
 * - Text capitalization
 * - Date formatting
 * 
 * These functions are used throughout the task management components
 * to maintain consistent formatting and display.
 */

import { parseISO, format } from "date-fns"

/**
 * Formats a date string into 12-hour time format (e.g., "02:30 PM")
 * @param dateString - ISO date string to format
 * @returns Formatted time string or empty string if no date provided
 */
export function format12HourTime(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = parseISO(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

/**
 * Formats a date string into a readable format (e.g., "Jan 1, 2024")
 * @param dateString - ISO date string to format
 * @returns Formatted date string or empty string if no date provided
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
} 