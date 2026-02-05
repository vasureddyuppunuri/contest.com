const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);
  return Math.round((end - start) / MS_PER_DAY);
};

const isSevenDaysApart = (startDate, endDate) => daysBetween(startDate, endDate) === 7;

const isConsecutiveWeek = (previousEndDate, currentStartDate) => {
  if (!previousEndDate) return false;
  return daysBetween(previousEndDate, currentStartDate) <= 1;
};

module.exports = {
  daysBetween,
  isSevenDaysApart,
  isConsecutiveWeek,
};
