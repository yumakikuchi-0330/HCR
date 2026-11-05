import { formatLongDate, formatShortDate, getToday } from './date';

describe('getToday', () => {
  // テストの後に時計を元に戻す
  afterEach(() => {
    jest.useRealTimers();
  });
  test('今日の日付を YYYY-MM-DD の形で返す', () => {
    // 「今日」を 2026年1月5日 に固定する（月・日が1桁の日で0埋めも確かめる）
    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 5));
    expect(getToday()).toBe('2026-01-05');
  });
});
describe('formatLongDate', () => {
  test('月・日を0埋めし、曜日を付ける', () => {
    expect(formatLongDate('2026-01-05')).toBe('2026年01月05日(月)');
  });
  test('年末の日付も正しく変換する', () => {
    expect(formatLongDate('2026-12-31')).toBe('2026年12月31日(木)');
  });
});
describe('formatShortDate', () => {
  test('月・日を0埋めせず、曜日を付ける', () => {
    expect(formatShortDate('2026-01-05')).toBe('1/5 (月)');
  });
  test('月・日が2桁の日付も正しく変換する', () => {
    expect(formatShortDate('2026-10-20')).toBe('10/20 (火)');
  });
});