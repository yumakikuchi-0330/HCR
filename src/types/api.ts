import type { Patient, Reservation } from './management';

// 受け取る
export type User = { id: string; loginId: string; password: string };

// 送るデータ（omitで省いてidのみ抜粋）
export type PatientRequest = Omit<Patient, 'id'>;
export type ReservationRequest = Omit<Reservation, 'id'>;

// POST,PUT（患者データ｜予約データ）
export type RequestBody = PatientRequest | ReservationRequest;
// APIのパス
export type ApiPath =
  | '/patients'                 // 患者の一覧
  | `/patients/${string}`       // 患者を1件
  | '/reservations'             // 予約の一覧
  | `/reservations/${string}`   // 予約を1件
  | `/reservations?${string}`;  // 予約を検索（値はなんでもOK）