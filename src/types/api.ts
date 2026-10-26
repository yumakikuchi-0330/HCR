import type { Patient, Reservation } from './management';

// 受け取る
export type User = { id: string; loginId: string; password: string };

// 送るデータ（omitで省いてidのみ抜粋）
export type PatientRequest = Omit<Patient, 'id'>;
export type ReservationRequest = Omit<Reservation, 'id'>;