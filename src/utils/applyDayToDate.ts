export const applyDayToDate = (date: Date | null, day: any): Date => {
  const newDate = new Date();

  // Apply day in local timezone
  newDate.setFullYear(day.year);
  newDate.setMonth(day.month - 1); // month in `Date` object is 0-based
  newDate.setDate(day.day);

  if (date) {
    // Apply hours in UTC
    newDate.setUTCHours(
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    );
  } else {
    // Manually zero out hours by applying offset (so it's 00:00 in user's timezone)
    newDate.setHours(0);
    newDate.setMinutes(newDate.getTimezoneOffset(), 0, 0);
  }

  return newDate;
};
