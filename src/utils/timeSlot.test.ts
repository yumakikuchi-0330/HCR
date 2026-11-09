import { getTimeSlots } from './timeSlot';
import type { Reservation } from '../types/management';

const createReservation = (
  time: string,
  status: Reservation['status'] = 'before',
): Reservation => ({
  id: `${time}-${status}`,
  patientId: 'p1',
  courseId: 'dock',
  date: '2026-11-06',
  time,
  options: [],
  status,
});

const findSlot = (reservations: Reservation[], time: string) =>
  getTimeSlots(reservations).find((slot) => slot.time === time);

describe('getTimeSlots', () => {
  test('予約がなければ、すべての枠が空きになる', () => {
    expect(getTimeSlots([]).every((slot) => slot.reservedBy === null)).toBe(true);
  });
  test('予約がある時間の枠には、予約した患者のIDが入る', () => {
    expect(findSlot([createReservation('09:00')], '09:00')?.reservedBy).toBe('p1');
  });
  test('予約がない時間の枠は空きのままになる', () => {
    expect(findSlot([createReservation('09:00')], '10:00')?.reservedBy).toBeNull();
  });
  test('キャンセルされた予約の枠は空きになる', () => {
    expect(findSlot([createReservation('09:00', 'cancel')], '09:00')?.reservedBy).toBeNull();
  });
  test('キャンセル後に同じ時間で予約し直された枠は予約済みになる', () => {
    const reservations = [createReservation('09:00', 'cancel'), createReservation('09:00')];
    expect(findSlot(reservations, '09:00')?.reservedBy).toBe('p1');
  });
});
