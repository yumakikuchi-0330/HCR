import { getAvailableDates, isClosedDay } from './reservation';
import type { Reservation } from '../types/management';

// 1日に予約できる枠の数（9〜18時のうち、昼休みの13時を除いた数）
const SLOT_COUNT = 9;

// 指定した日に、指定した数の予約を作る
const createReservations = (
  date: string,
  count: number,
  status: Reservation['status'] = 'before',
): Reservation[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${date}-${status}-${index}`,
    patientId: 'p1',
    courseId: 'dock',
    date,
    time: '09:00',
    options: [],
    status,
  }));

// 予約できる日を、日付の文字列だけの一覧にする
const getDates = (reservations: Reservation[] = []) =>
  getAvailableDates(reservations).map((availableDate) => availableDate.date);

describe('isClosedDay', () => {
  test('土曜日は休診日になる', () => {
    expect(isClosedDay('2026-11-07')).toBe(true);
  });
  test('日曜日は休診日になる', () => {
    expect(isClosedDay('2026-11-08')).toBe(true);
  });
  test('平日の祝日は休診日になる（2026-11-23 は勤労感謝の日）', () => {
    expect(isClosedDay('2026-11-23')).toBe(true);
  });
  test('祝日ではない平日は休診日にならない', () => {
    expect(isClosedDay('2026-11-06')).toBe(false);
  });
});

describe('getAvailableDates', () => {
  beforeEach(() => {
    // 「今日」を 2026年11月5日（木）に固定する
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 5));
  });
  // テストの後に時計を元に戻す
  afterEach(() => {
    jest.useRealTimers();
  });

  test('今日は予約できて、昨日は予約できない', () => {
    const dates = getDates();
    expect(dates).toContain('2026-11-05');
    expect(dates).not.toContain('2026-11-04');
  });
  test('土日祝は予約できない', () => {
    const dates = getDates();
    expect(dates).not.toContain('2026-11-07');
    expect(dates).not.toContain('2026-11-08');
    expect(dates).not.toContain('2026-11-23');
  });
  test('予約枠がすべて埋まった日は予約できない', () => {
    expect(getDates(createReservations('2026-11-06', SLOT_COUNT))).not.toContain('2026-11-06');
  });
  test('予約枠が1つでも残っている日は予約できる', () => {
    expect(getDates(createReservations('2026-11-06', SLOT_COUNT - 1))).toContain('2026-11-06');
  });
  test('キャンセルされた予約は予約枠の数に含めない', () => {
    const reservations = [
      ...createReservations('2026-11-06', SLOT_COUNT - 1),
      ...createReservations('2026-11-06', 1, 'cancel'),
    ];
    expect(getDates(reservations)).toContain('2026-11-06');
  });
  test('今日を含めて90日間は予約できて、それより先は予約できない', () => {
    const dates = getDates();
    expect(dates).toContain('2027-02-02');
    expect(dates).not.toContain('2027-02-03');
  });
});
