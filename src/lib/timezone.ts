/**
 * Parse match time string and convert to Taipei time (UTC+8).
 *
 * Handles two formats:
 *   "1:00p.m. UTC−6"  — group stage with explicit UTC offset
 *   "17:00"            — knockout stage, assumed UTC
 */
export function formatMatchTime(dateStr: string, timeStr: string): string {
  const taipeiDate = toTaipeiTime(dateStr, timeStr);
  if (!taipeiDate) {
    // Fallback: display original time as-is
    return `${dateStr} ${timeStr}`;
  }

  const month = String(taipeiDate.getMonth() + 1).padStart(2, "0");
  const day = String(taipeiDate.getDate()).padStart(2, "0");
  const hour = String(taipeiDate.getHours()).padStart(2, "0");
  const minute = String(taipeiDate.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

/**
 * Convert match date+time to a Taipei-time Date object.
 * Returns null if parsing fails.
 */
export function toTaipeiTime(dateStr: string, timeStr: string): Date | null {
  try {
    // Format 1: "1:00p.m. UTC−6"
    const ampmMatch = timeStr.match(
      /^(\d{1,2}):(\d{2})\s*(p\.m\.|a\.m\.)\s*UTC([−-])(\d{1,2})$/
    );
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1], 10);
      const minute = parseInt(ampmMatch[2], 10);
      const isPM = ampmMatch[3] === "p.m.";
      const offsetSign = ampmMatch[4] === "−" || ampmMatch[4] === "-" ? -1 : 1;
      const offsetHours = parseInt(ampmMatch[5], 10);

      // Convert 12h to 24h
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      // Create UTC date
      const utcDate = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
      // Adjust for UTC offset
      const localUtc = new Date(utcDate.getTime() - offsetSign * offsetHours * 3600000);
      // Convert to Taipei (UTC+8)
      return new Date(localUtc.getTime() + 8 * 3600000);
    }

    // Format 2: "17:00" (assumed UTC)
    const hr24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (hr24Match) {
      const hour = parseInt(hr24Match[1], 10);
      const minute = parseInt(hr24Match[2], 10);
      // Create UTC date then add 8 hours for Taipei
      const utcDate = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
      return new Date(utcDate.getTime() + 8 * 3600000);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format a date for display (without time).
 * Uses Taipei timezone if a time string is provided.
 */
export function formatDate(dateStr: string, timeStr?: string): string {
  if (timeStr) {
    const taipeiDate = toTaipeiTime(dateStr, timeStr);
    if (taipeiDate) {
      return taipeiDate.toLocaleDateString("zh-TW", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    }
  }
  // Fallback
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric", weekday: "short" });
}
