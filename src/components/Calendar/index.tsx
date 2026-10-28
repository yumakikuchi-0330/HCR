import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { DayCellContentArg } from '@fullcalendar/core';
import dayjs from 'dayjs';
import type { AvailableDate } from '../../types/management';
import './style.css';
import { DATE_FORMAT } from '../../types/type';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

type Props = {
  // 予約可能な日付の一覧
  events?: AvailableDate[];
  // 選択中の日付
  selectedDate: string | null;
  // 日付を選んだときに "0000-00-00" を受け取る
  onSelect: (date: string) => void;
};

const Calendar= ({ events, selectedDate, onSelect }: Props) => {
  // 予約可能日の指定がなければnull（すべて選択可）
  const availableDates = useMemo(
    () => (events ? new Set(events.map((event) => event.date)) : null),
    [events],
  );
  // 選択できる日か（指定がなければすべて選択可、指定があれば予約可能な日で今日以降）
  const isSelectable = (dateStr: string) => {
    if (!availableDates) {
      return true;
    }
    return availableDates.has(dateStr) && !dayjs(dateStr).isBefore(dayjs(), 'day');
  };
  // 各日付セルに付けるclassName（選択できない日・選択中の日）
  const getDayCellClassNames = (arg: DayCellContentArg) => {
    const dateStr = dayjs(arg.date).format(DATE_FORMAT);
    const classNames: string[] = [];
    if (!isSelectable(dateStr)) classNames.push('is-unavailable');
    if (dateStr === selectedDate) classNames.push('is-selected');
    return classNames;
  };
  // 日付がクリックされたときの処理（選択できない日は何もしない）
  const handleDateClick = (arg: DateClickArg) => {
    if (!isSelectable(arg.dateStr)) {
      return;
    }
    onSelect(arg.dateStr);
  };
  return (
    <div className='calendar'>
      <FullCalendar
        // 使用するプラグインを指定（Bootstrap 5のテーマを追加）
        plugins={[dayGridPlugin, interactionPlugin, bootstrap5Plugin]}
        // ボタンなどの見た目をBootstrap 5にする
        themeSystem="bootstrap5"
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        // カレンダーの初期表示の種類を「月表示」に設定
        initialView="dayGridMonth"
        initialDate={selectedDate ?? undefined}
        height="auto"
        locale="ja"
        dateClick={handleDateClick}
        dayCellClassNames={getDayCellClassNames}
      />
    </div>
  );
};

export default Calendar;