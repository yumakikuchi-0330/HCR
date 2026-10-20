// 予約できる時間枠,ステータス,健診コース
export const COURSES = ['人間ドック', '定期健診', '生活習慣病'] as const;
export const RESERVATION_STATUSES = ['受診前', '受診中', '受診済', 'キャンセル'] as const;
export const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'] as const;