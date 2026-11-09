import type { Reservation } from '../types/management';
import { TIME_SLOTS } from '../types/type';
import type { TimeSlot } from '../types/type';

// その日の予約一覧から、予約済みの情報を入れた時間枠の一覧を作る
export const getTimeSlots = (reservations: Reservation[]): TimeSlot[] =>
  TIME_SLOTS.map((slot) => {
    const reservation = reservations.find(
      ({ time, status }) => time === slot.time && status !== 'cancel',
    );
    return { ...slot, reservedBy: reservation ? reservation.patientId : null };
  });
