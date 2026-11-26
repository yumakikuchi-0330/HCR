import holiday_jp from '@holiday-jp/holiday_jp';
import dayjs from 'dayjs';

export const isHoliday = (date: string) => holiday_jp.isHoliday(dayjs(date).toDate());
