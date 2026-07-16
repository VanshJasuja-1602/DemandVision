export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

/**
 * Calculates cyclic calendar features and metadata for a selected date.
 * Custom parsing is used to prevent timezone shifts (UTC vs. local).
 * 
 * @param {string|Date} selectedDate - The date input (YYYY-MM-DD)
 * @returns {Object} Engineered features and display strings
 */
export function calculateCalendarFeatures(selectedDate) {
  if (!selectedDate) return null;
  
  let date;
  if (typeof selectedDate === 'string') {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1; // 0-based for JS Date
      const day = parseInt(parts[2], 10);
      date = new Date(year, monthIndex, day);
    } else {
      date = new Date(selectedDate);
    }
  } else {
    date = new Date(selectedDate);
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid Date format provided.");
  }

  const dayOfWeek = date.getDay(); // Sunday = 0
  const adjustedDayOfWeek = (dayOfWeek + 6) % 7; // Monday = 0, Sunday = 6
  const month = date.getMonth() + 1; // 1 to 12

  const isWeekend = (adjustedDayOfWeek === 5 || adjustedDayOfWeek === 6) ? 1 : 0;

  const dayOfWeekSin = Math.sin((2 * Math.PI * adjustedDayOfWeek) / 7);
  const dayOfWeekCos = Math.cos((2 * Math.PI * adjustedDayOfWeek) / 7);

  const monthSin = Math.sin((2 * Math.PI * month) / 12);
  const monthCos = Math.cos((2 * Math.PI * month) / 12);

  // Return full engineered object
  return {
    dateString: date.toISOString().split('T')[0],
    weekdayName: WEEKDAYS[adjustedDayOfWeek],
    monthName: MONTHS[month - 1],
    dayOfMonth: date.getDate(),
    year: date.getFullYear(),
    adjustedDayOfWeek,
    month,
    isWeekend,
    dayOfWeekSin,
    dayOfWeekCos,
    monthSin,
    monthCos
  };
}
