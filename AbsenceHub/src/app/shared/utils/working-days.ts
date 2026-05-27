const FIXED_HOLIDAYS_MM_DD = [
  '01-01', // Año Nuevo
  '01-06', // Reyes Magos
  '05-01', // Día del Trabajador
  '08-15', // Asunción de la Virgen
  '10-12', // Fiesta Nacional de España
  '11-01', // Todos los Santos
  '12-06', // Día de la Constitución
  '12-08', // Inmaculada Concepción
  '12-25', // Navidad
];

// Meeus/Jones/Butcher algorithm
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const holidayCache = new Map<number, Set<string>>();

function holidaysForYear(year: number): Set<string> {
  if (holidayCache.has(year)) return holidayCache.get(year)!;
  const set = new Set<string>();
  for (const mmdd of FIXED_HOLIDAYS_MM_DD) {
    set.add(`${year}-${mmdd}`);
  }
  const easter = easterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  set.add(dateToStr(goodFriday));
  holidayCache.set(year, set);
  return set;
}

export function isWeekendDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}

export function isHolidayDate(dateStr: string): boolean {
  return holidaysForYear(Number(dateStr.slice(0, 4))).has(dateStr);
}

export function countWorkingDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate || endDate < startDate) return 0;
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end   = new Date(ey, em - 1, ed);
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6 && !holidaysForYear(cur.getFullYear()).has(dateToStr(cur))) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
