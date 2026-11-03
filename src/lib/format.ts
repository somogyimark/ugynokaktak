const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

/** "1934-05-14" → "1934. május 14.", "1934" → "1934.", anything else is shown as written. */
export function formatDate(value: string): string {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (full) {
    const month = MONTHS[Number(full[2]) - 1];
    if (month) return `${full[1]}. ${month} ${Number(full[3])}.`;
  }
  if (/^\d{4}$/.test(value)) return `${value}.`;
  return value;
}

const numberFormat = new Intl.NumberFormat('hu-HU');

/** Hungarian thousands separator (narrow no-break space). */
export function formatNumber(n: number): string {
  return numberFormat.format(n);
}
