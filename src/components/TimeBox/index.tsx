import React from "react"
import './style.css';
import type { TimeSlot } from '../../types/type';

type TimeProps = {
  slots: readonly TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export const TimeBox = ({slots, selectedTime, onSelect}: TimeProps) =>{
  const displaySlots = slots.filter((slot) => slot.isAvailable);
  return(
    <div className="time-select">
      {displaySlots.map((slot) => {
        // 予約済み判定
        const isReserved = slot.reservedBy !== null;
        // 選択中の時間が一致しているか判定
        const isSelected = slot.time === selectedTime;
        return(
          <div key={slot.time}>
            <button
              type="button"
              className="time-button"
              disabled={isReserved}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot.time)}
            >
              <span className="time-button_time">{slot.time}</span>
            </button>
          </div>
        );
      })}
    </div>
  )
};

export default TimeBox;