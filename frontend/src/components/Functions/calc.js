export const calculateTotalPrice = (start, end, pricePerHour) => {
  // Convert time strings to hours and minutes
  let [startHour, startMinute] = start.split(":").map(Number);
  let [endHour, endMinute] = end.split(":").map(Number);

  // Convert everything to minutes
  let startTotalMinutes = startHour * 60 + startMinute;
  let endTotalMinutes = endHour * 60 + endMinute;

  // Calculate total hours (assuming same day)
  let totalHours = (endTotalMinutes - startTotalMinutes) / 60;

  // Calculate total price
  return totalHours * pricePerHour;
};

// Format date to a more readable format
export const formatDate = (dateString) => {
  if (!dateString) return "N/A"

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return new Date(dateString).toLocaleDateString("en-US", options)
}


export const convertToDate = (dateString) => {
  if (!dateString) return "N/A";
  // If it's a number or numeric string, treat as timestamp
  if (!isNaN(dateString)) {
    return new Date(Number(dateString)).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
  }
  // Otherwise, treat as ISO date string
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
};