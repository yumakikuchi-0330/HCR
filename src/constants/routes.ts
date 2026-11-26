export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  // 新規患者登録画面
  RESERVATION_NEW: '/reservations/new',
  // 予約日登録画面
  RESERVATION_DATE: '/reservations/new/date',
  // 予約時間選択画面
  RESERVATION_TIME: '/reservations/new/time',
  // 患者詳細画面
  PATIENT_DETAIL: '/patients/:id',
  // 患者編集画面
  PATIENT_EDIT: '/patients/:id/edit',
  // 予約確認画面
  RESERVATION_CONFIRM: '/reservations/new/confirm',
  // 予約確定画面
  RESERVATION_COMPLETE: '/reservations/new/complete',
} as const;
