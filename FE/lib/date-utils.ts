/**
 * Date utilities for consistent date handling across the application
 */

import { format, formatDistanceToNow, parseISO, isValid, isBefore, isAfter } from 'date-fns';

/**
 * Formats a date string or Date object to standard display format
 * @param date Date string or Date object
 * @param formatString Optional custom format string
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(date: string | Date | undefined | null, formatString = 'PPP'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Formats a date as relative to current time (e.g., "2 days ago", "in 3 hours")
 * @param date Date string or Date object
 * @returns Relative time string or empty string if invalid
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Formats a date as a short date (e.g., "Jan 2, 2023")
 * @param date Date string or Date object
 * @returns Short date string or empty string if invalid
 */
export function formatShortDate(date: string | Date | undefined | null): string {
  return formatDate(date, 'MMM d, yyyy');
}

/**
 * Checks if a date is in the past
 * @param date Date string or Date object
 * @returns True if date is in the past, false otherwise
 */
export function isDatePast(date: string | Date | undefined | null): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    return isBefore(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is past:', error);
    return false;
  }
}

/**
 * Checks if a date is in the future
 * @param date Date string or Date object
 * @returns True if date is in the future, false otherwise
 */
export function isDateFuture(date: string | Date | undefined | null): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    return isAfter(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is future:', error);
    return false;
  }
}

/**
 * Converts a Date object to ISO string format
 * @param date Date object
 * @returns ISO string or undefined if invalid
 */
export function toISOString(date: Date | undefined | null): string | undefined {
  if (!date || !isValid(date)) return undefined;
  return date.toISOString();
}

/**
 * Gets the ISO date string (YYYY-MM-DD) from a date
 * @param date Date string or Date object
 * @returns ISO date string or undefined if invalid
 */
export function toISODateString(date: Date | string | undefined | null): string | undefined {
  if (!date) return undefined;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return undefined;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting to ISO date string:', error);
    return undefined;
  }
}

/**
 * Determines the status of a due date (overdue, near due, future)
 * @param dueDate Due date string or Date object
 * @returns Status of the due date
 */
export function getDueDateStatus(dueDate: string | Date | undefined | null): 'overdue' | 'near-due' | 'future' | 'none' {
  if (!dueDate) return 'none';
  
  try {
    const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    if (!isValid(dateObj)) return 'none';
    
    const today = new Date();
    const nearDueThreshold = new Date();
    nearDueThreshold.setDate(today.getDate() + 3); // 3 days from now
    
    if (isBefore(dateObj, today)) {
      return 'overdue';
    } else if (isBefore(dateObj, nearDueThreshold)) {
      return 'near-due';
    } else {
      return 'future';
    }
  } catch (error) {
    console.error('Error determining due date status:', error);
    return 'none';
  }
} 