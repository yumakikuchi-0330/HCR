const DATE_DIGITS = 2; // 月・日の桁数
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 数字を2桁の文字列に変更する
const toTwoDigits = (num: number) => String(num).padStart(DATE_DIGITS, '0');

// Dateから年・2桁の月・2桁の日を取り出す
const toDateParts = (date: Date) => ({
  y: date.getFullYear(),
  m: toTwoDigits(date.getMonth() + 1),
  d: toTwoDigits(date.getDate()),
});

// "0000-00-00" → Dateに変更する関数
const toDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// 今日の日付を0000-00-00の形で返す関数
export const getToday = () => {
  const { y, m, d } = toDateParts(new Date());
  return `${y}-${m}-${d}`;
};

// "0000-00-00" → "0000年00月00日(水)"に変更する関数
export const formatLongDate = (dateStr: string) => {
  const date = toDate(dateStr);
  const { y, m, d } = toDateParts(date);
  return `${y}年${m}月${d}日(${WEEKDAYS[date.getDay()]})`;
};

// "2026-10-20" → "10/20 (火)"（一覧用）
export const formatShortDate = (dateStr: string) => {
  const date = toDate(dateStr);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d} (${WEEKDAYS[date.getDay()]})`;
};
