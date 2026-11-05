import dayjs from 'dayjs';
import 'dayjs/locale/ja';

// 今日の日付を0000-00-00の形で返す関数
export const getToday = () => dayjs().format('YYYY-MM-DD');

// "0000-00-00" → "0000年00月00日(水)"に変更する関数
export const formatLongDate = (dateStr: string) =>
  dayjs(dateStr).locale('ja').format('YYYY年MM月DD日(dd)');

// "2026-10-20" → "10/20 (火)"（一覧用）
export const formatShortDate = (dateStr: string) =>
  dayjs(dateStr).locale('ja').format('M/D (dd)');
