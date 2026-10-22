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

// 検査オプション
export const OPTIONS = [
  { optionId: 1, optionName: '胃カメラ' },
  { optionId: 2, optionName: '腹部エコー' },
  { optionId: 3, optionName: '腫瘍マーカー' },
  { optionId: 4, optionName: '乳がん検診' },
  { optionId: 5, optionName: '脳MRI' },
] as const;
export type Option = (typeof OPTIONS)[number];
export type OptionId = Option['optionId'];

// 時間
export type TimeSlot = {
  time: string;
  isAvailable: boolean;
  reservedBy: string | null;
};

// 予約時間枠（0:00〜23:00[13時は昼休み、9:00〜18:00が予約可能]）
export const TIME_SLOTS: readonly TimeSlot[] = [
  { time: '00:00', isAvailable: false, reservedBy: null },
  { time: '01:00', isAvailable: false, reservedBy: null },
  { time: '02:00', isAvailable: false, reservedBy: null },
  { time: '03:00', isAvailable: false, reservedBy: null },
  { time: '04:00', isAvailable: false, reservedBy: null },
  { time: '05:00', isAvailable: false, reservedBy: null },
  { time: '06:00', isAvailable: false, reservedBy: null },
  { time: '07:00', isAvailable: false, reservedBy: null },
  { time: '08:00', isAvailable: false, reservedBy: null },
  { time: '09:00', isAvailable: true,  reservedBy: null },
  { time: '10:00', isAvailable: true,  reservedBy: null },
  { time: '11:00', isAvailable: true,  reservedBy: null },
  { time: '12:00', isAvailable: true,  reservedBy: null },
  { time: '13:00', isAvailable: false, reservedBy: null }, // 昼休み
  { time: '14:00', isAvailable: true,  reservedBy: null },
  { time: '15:00', isAvailable: true,  reservedBy: null },
  { time: '16:00', isAvailable: true,  reservedBy: null },
  { time: '17:00', isAvailable: true,  reservedBy: null },
  { time: '18:00', isAvailable: true,  reservedBy: null },
  { time: '19:00', isAvailable: false, reservedBy: null },
  { time: '20:00', isAvailable: false, reservedBy: null },
  { time: '21:00', isAvailable: false, reservedBy: null },
  { time: '22:00', isAvailable: false, reservedBy: null },
  { time: '23:00', isAvailable: false, reservedBy: null },
];
