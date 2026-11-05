import { isHoliday } from './holiday';

describe('isHoliday', () => {
  test('祝日なら true を返す', () => {
    expect(isHoliday('2026-11-23')).toBe(true);
  });
  test('祝日でなければ false を返す', () => {
    expect(isHoliday('2026-11-24')).toBe(false);
  });
});