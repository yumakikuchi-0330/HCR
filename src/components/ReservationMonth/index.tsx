import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { DayCellContentArg } from '@fullcalendar/core';
import type { AvailableDate } from "../../types/management";

// 親コンポーネントから予約可能なイベント情報の配列を受け取る
type Props = { events: AvailableDate[]  };

const toDateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const ReservationMonth = ({ events }: Props) => {
  // 月表示カレンダー内で、ユーザーがクリックした日付を覚えておくための状態
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // useMemoを使うことで、`events`データが変更されない限り、この重い計算を再実行しないようにしている（パフォーマンス最適化）
const availableDates = useMemo(() => {
    // Setを使うと、重複する日付が自動でなくなり、特定の日付が含まれているかのチェック（.has()）が高速になる
    return new Set(events.map((event) => event.date));
  }, [events]);
  // 各日付セルの見た目をカスタマイズするための関数
  const getDayCellClassNames = (arg: DayCellContentArg) => {
    // このセルが描画しようとしている日付の文字列
    const dateStr = toDateStr(arg.date);
    // この日付が、予約可能な日付リストに含まれているかチェック
    const isAvailable = availableDates.has(dateStr);
    // この日付が、現在ユーザーによって選択されているかチェック
    const isSelected = dateStr === selectedDate;
    const classNames: string[] = [];
    if (!isAvailable) classNames.push('is-unavailable');
    if (isSelected) classNames.push('is-selected');
    return classNames;
  };
  // 日付がクリックされたときに呼び出される関数
  const handleDateClick = (arg: DateClickArg) => {
    // 予約可能な日付でなかった場合は、ここで処理を終了し、何も起こさない
    if (!availableDates.has(arg.dateStr)) {
        return;
    }
    // 予約可能な日付の場合のみ、その日付をstateに保存する
    setSelectedDate(arg.dateStr);
  };
  return (
    <FullCalendar
      // 使用するプラグインを指定
      plugins={[dayGridPlugin, interactionPlugin]}
      // カレンダーの初期表示の種類を「月表示」に設定
      initialView="dayGridMonth"
      locale="ja"
      dateClick={handleDateClick}
      dayCellContent={getDayCellClassNames}
    />
  );
};

export default ReservationMonth;