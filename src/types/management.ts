import type { CourseId, ReservationStatusId } from './type';

// 選択された日付と時間の型
export type SelectionValue = {
  data: string | null;
  time: string | null;
};

// 患者データ
export type Patient = {
  id: string;
  name: string;
  nameKana: string;
  birthDate: string;
  gender: '男性' | '女性';
  insurance?: string; // 健保
  address?: string;
  medicalHistory?: string;// 既往歴
  note?: string;       // 連絡事項
};

// 患者情報入力
export type Reservation = {
  id: string;
  patientId: string;
  courseId: CourseId;
  date: string;
  time: string;
  options: string[];
  status: ReservationStatusId;
};

// 予約可能な日
export type AvailableDate = {
  date: string;
};