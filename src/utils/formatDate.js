const LOCALE = 'ar-SY';

const SHORT_OPTS = { day: '2-digit', month: 'long',  year: 'numeric' };
const LONG_OPTS  = { day: '2-digit', month: 'long',  year: 'numeric', hour: '2-digit', minute: '2-digit' };

/** تاريخ عربي قصير: "١٥ مايو ٢٠٢٥" */
export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(LOCALE, SHORT_OPTS);
  } catch {
    return String(value).slice(0, 10);
  }
}

/** تاريخ + وقت عربي: "١٥ مايو ٢٠٢٥، ٠٩:٣٠ م" */
export function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(LOCALE, LONG_OPTS);
  } catch {
    return String(value).slice(0, 16);
  }
}

/** تاريخ مضغوط: "2025-05-15" — للحقول التقنية */
export function formatDateISO(value) {
  if (!value) return '—';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return String(value).slice(0, 10);
  }
}
