// ログインフォームの入力値
export type LoginFormValues = {
  loginId: string;
  password: string;
};
// 正しい値以外のときエラーになる
export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

// 健診コース
export const COURSES = [
  { courseId: 'dock', courseName: '人間ドック' },
  { courseId: 'regular', courseName: '定期健診' },
  { courseId: 'lifestyle', courseName: '生活習慣病' },
] as const;
export type Course = (typeof COURSES)[number];
export type CourseId = Course['courseId'];

// 予約ステータス
export const RESERVATION_STATUSES = [
  { statusId: 'before', statusName: '受診前' },
  { statusId: 'inProgress', statusName: '受診中' },
  { statusId: 'complete', statusName: '受診済' },
  { statusId: 'cancel', statusName: 'キャンセル' },
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type ReservationStatusId = ReservationStatus['statusId'];

// 予約可能な時間帯
export const AVAILABLE_TIMES: readonly string[] = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

const DAYS = 24;
export type TimeSlot = {
  time: string;
  isAvailable: boolean;
  reservedBy: string | null;
};

const slots: TimeSlot[] = [];
// 0時から23時まで1時間ごと
for (let hour = 0; hour < DAYS; hour++) {
  // 0〜9時は先頭に0をつける
  let hourString = String(hour);
  if (hour < 10) {
    hourString = '0' + hour;
  }
  const time = hourString + ':00';
  slots.push({
    time,
    isAvailable: AVAILABLE_TIMES.includes(time), // 予約できる時間か判定
    reservedBy: null, // 予約している人のID
  });
}

export const TIME_SLOTS: readonly TimeSlot[] = slots;
