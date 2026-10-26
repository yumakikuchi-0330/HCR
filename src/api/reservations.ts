import { get, post, put } from './common';
import type { Reservation } from '../types/management';
import type { ReservationRequest } from '../types/api';

// 予約一覧を取得（全件取得したいから引数なし、Reservationオブジェクトの配列を返す）
export const fetchReservations = (): Promise<Reservation[]> => get('/reservations');
// 指定した日の予約を取得（日付の文字列を取得）
export const fetchReservationsDate = (date: string): Promise<Reservation[]> =>
  get(`/reservations?date=${date}`);
// 指定した患者の予約を取得（患者IDから取得、予約履歴）
export const fetchReservationsPatient = (patientId: string): Promise<Reservation[]> =>
  get(`/reservations?patientId=${patientId}`);
// 予約を新規登録（post通信を使ってdataを新規作成）
export const createReservation = (data: ReservationRequest): Promise<Reservation> =>
  post('/reservations', data);
// 予約を更新（put通信を使って予約内容の書き換え）
export const updateReservation = (id: string, data: ReservationRequest): Promise<Reservation> =>
  put(`/reservations/${id}`, data);
