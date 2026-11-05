import dayjs from 'dayjs';
import { isHoliday } from './holiday';
import type { AvailableDate, Reservation } from '../types/management';
import { DATE_FORMAT, TIME_SLOTS } from '../types/type';

// 今日から何日先まで予約を受け付けるか
const RESERVABLE_DAYS = 90;
// 1日に予約できる枠の数（isAvailable が true の時間だけ数える）
const SLOT_COUNT = TIME_SLOTS.filter((slot) => slot.isAvailable).length;
const SATURDAY = 6;
const SUNDAY = 0;

// 土日祝なら true を返す
export const isClosedDay = (date: string) => {
  const day = dayjs(date).day();
  return day === SUNDAY || day === SATURDAY || isHoliday(date);
};

// 予約一覧から予約できる日の一覧を作る
export const getAvailableDates = (reservations: Reservation[]): AvailableDate[] => {
  // 例：2026-11-05: 9
  const reservedCounts: Record<string, number> = {};
  reservations.forEach((reservation) => {
    // キャンセルされた予約は枠を使っていないので数えない
    if (reservation.status === 'cancel') return;
    // その日の予約数を1増やす
    reservedCounts[reservation.date] = (reservedCounts[reservation.date] ?? 0) + 1;
  });
  return Array.from({ length: RESERVABLE_DAYS }, (_, index) =>
    dayjs().add(index, 'day').format(DATE_FORMAT),
  )
    // 予約数が枠の数より少ない日だけ残す（埋まっている日は選べない）
    .filter((date) => (reservedCounts[date] ?? 0) < SLOT_COUNT)
    // 土日祝は休診なので予約できない
    .filter((date) => !isClosedDay(date))
    .map((date) => ({ date }));
};
