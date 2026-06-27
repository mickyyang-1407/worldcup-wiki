const formatToTaipeiTime = (dateStr, timeStr) => {
  try {
    const timeRegex = /(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)\s*UTC([+−-]\d+)/i;
    const match = timeStr.match(timeRegex);
    if (!match) return `${dateStr.slice(5)} ${timeStr}`; 

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toLowerCase();
    const offsetStr = match[4].replace('−', '-');
    const offset = parseInt(offsetStr, 10);

    if (period === 'p.m.' && hours !== 12) hours += 12;
    if (period === 'a.m.' && hours === 12) hours = 0;

    const dateObj = new Date(`${dateStr}T00:00:00Z`);
    dateObj.setUTCHours(hours - offset);
    dateObj.setUTCMinutes(minutes);

    const taipeiFormatter = new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return taipeiFormatter.format(dateObj).replace(/\//g, '-');
  } catch (e) {
    return `${dateStr.slice(5)} ${timeStr}`;
  }
};

console.log(formatToTaipeiTime("2026-06-11", "1:00p.m. UTC−6"));
console.log(formatToTaipeiTime("2026-06-28", "10:00a.m. UTC-4"));
