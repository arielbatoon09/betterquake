export function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return "destructive";
  if (magnitude >= 6) return "destructive";
  if (magnitude >= 5) return "destructive";
  if (magnitude >= 4) return "default";
  if (magnitude >= 3) return "secondary";
  return "outline";
}

export function getMagnitudeLabel(magnitude: number): string {
  if (magnitude >= 7) return "Major";
  if (magnitude >= 6) return "Strong";
  if (magnitude >= 5) return "Moderate";
  if (magnitude >= 4) return "Light";
  if (magnitude >= 3) return "Minor";
  return "Micro";
}

export function getMagnitudeColorClass(magnitude: number): string {
  if (magnitude >= 7) return "bg-red-600 text-white";
  if (magnitude >= 6) return "bg-red-500 text-white";
  if (magnitude >= 5) return "bg-orange-500 text-white";
  if (magnitude >= 4) return "bg-yellow-500 text-black";
  if (magnitude >= 3) return "bg-blue-500 text-white";
  return "bg-gray-500 text-white";
}

export function parsePhivolcsDate(dateStr: string): Date | null {
  try {
    // Format: "27 November 2025 - 10:04 AM"
    const cleaned = dateStr.replace(" - ", " ");
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const date = parsePhivolcsDate(dateStr);
    if (!date) return dateStr;
    
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function getRelativeTime(dateStr: string): string {
  try {
    const date = parsePhivolcsDate(dateStr);
    if (!date) return dateStr;
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

export function getDataPeriodInfo(dateStrings: string[]): {
  monthYear: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrentMonth: boolean;
} | null {
  if (dateStrings.length === 0) {
    return null;
  }

  const dates = dateStrings
    .map(parsePhivolcsDate)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return null;

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const now = new Date();

  // Use the most recent date's month for display
  const displayMonth = endDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Check if the data includes the current month
  const isCurrentMonth =
    endDate.getMonth() === now.getMonth() &&
    endDate.getFullYear() === now.getFullYear();

  return {
    monthYear: displayMonth,
    startDate,
    endDate,
    isCurrentMonth,
  };
}