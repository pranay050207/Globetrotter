// Common timezone options
export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'IST - Indian Standard Time (UTC+5:30)' },
  { value: 'America/New_York', label: 'EST - Eastern Standard Time (UTC-5)' },
  { value: 'America/Chicago', label: 'CST - Central Standard Time (UTC-6)' },
  { value: 'America/Denver', label: 'MST - Mountain Standard Time (UTC-7)' },
  { value: 'America/Los_Angeles', label: 'PST - Pacific Standard Time (UTC-8)' },
  { value: 'Europe/London', label: 'GMT - Greenwich Mean Time (UTC+0)' },
  { value: 'Europe/Paris', label: 'CET - Central European Time (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'JST - Japan Standard Time (UTC+9)' },
  { value: 'Asia/Shanghai', label: 'CST - China Standard Time (UTC+8)' },
  { value: 'Australia/Sydney', label: 'AEST - Australian Eastern Standard Time (UTC+10)' },
  { value: 'Asia/Dubai', label: 'GST - Gulf Standard Time (UTC+4)' },
  { value: 'Asia/Singapore', label: 'SGT - Singapore Time (UTC+8)' },
  { value: 'Europe/Moscow', label: 'MSK - Moscow Standard Time (UTC+3)' },
  { value: 'America/Toronto', label: 'EST - Eastern Standard Time (UTC-5)' },
  { value: 'America/Vancouver', label: 'PST - Pacific Standard Time (UTC-8)' },
];

/**
 * Get user's timezone from localStorage or default to IST
 */
export function getUserTimezone(): string {
  try {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.timezone || 'Asia/Kolkata';
    }
  } catch (error) {
    console.warn('Error reading user timezone preference:', error);
  }
  return 'Asia/Kolkata'; // Default to IST as requested
}

/**
 * Format date in user's timezone
 */
export function formatDateInUserTimezone(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const userTimezone = getUserTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return dateObj.toLocaleDateString('en-US', {
      timeZone: userTimezone,
      ...options
    });
  } catch (error) {
    console.warn('Error formatting date in timezone:', error);
    return dateObj.toLocaleDateString('en-US', options);
  }
}

/**
 * Format time in user's timezone
 */
export function formatTimeInUserTimezone(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const userTimezone = getUserTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return dateObj.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour12: true,
      ...options
    });
  } catch (error) {
    console.warn('Error formatting time in timezone:', error);
    return dateObj.toLocaleTimeString('en-US', { hour12: true, ...options });
  }
}

/**
 * Format date and time in user's timezone
 */
export function formatDateTimeInUserTimezone(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const userTimezone = getUserTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return dateObj.toLocaleString('en-US', {
      timeZone: userTimezone,
      hour12: true,
      ...options
    });
  } catch (error) {
    console.warn('Error formatting datetime in timezone:', error);
    return dateObj.toLocaleString('en-US', { hour12: true, ...options });
  }
}

/**
 * Convert date to user's timezone
 */
export function convertToUserTimezone(date: Date | string): Date {
  const userTimezone = getUserTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    // Get the timezone offset
    const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc);
    
    // Format the date in the target timezone to get the offset
    const targetDate = new Date(targetTime.toLocaleString('en-US', { timeZone: userTimezone }));
    const offset = targetDate.getTime() - targetTime.getTime();
    
    return new Date(utc + offset);
  } catch (error) {
    console.warn('Error converting to user timezone:', error);
    return dateObj;
  }
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc);
    const targetDate = new Date(targetTime.toLocaleString('en-US', { timeZone: timezone }));
    const offset = targetDate.getTime() - targetTime.getTime();
    return offset / (1000 * 60 * 60); // Convert to hours
  } catch (error) {
    console.warn('Error getting timezone offset:', error);
    return 0;
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 0) {
    // Future date
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 'in a few seconds';
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
    if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;
    if (absDiff < 31536000) return `in ${Math.floor(absDiff / 2592000)} months`;
    return `in ${Math.floor(absDiff / 31536000)} years`;
  } else {
    // Past date
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const abbreviations: Record<string, string> = {
    'Asia/Kolkata': 'IST',
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEST',
    'Asia/Dubai': 'GST',
    'Asia/Singapore': 'SGT',
    'Europe/Moscow': 'MSK',
    'America/Toronto': 'EST',
    'America/Vancouver': 'PST',
  };
  
  return abbreviations[timezone] || timezone.split('/').pop() || timezone;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return dateObj.toDateString() === tomorrow.toDateString();
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return dateObj.toDateString() === yesterday.toDateString();
}
