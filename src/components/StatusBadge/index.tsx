import React from "react"
import './style.css';
import { RESERVATION_STATUSES, ReservationStatusId } from '../../types/type';

type Props = {
  statusId: ReservationStatusId;
}

export const StatusBadge = ({statusId}: Props) =>{
  const status = RESERVATION_STATUSES.find((s) => s.statusId === statusId);
  if(!status){
    return null;
  }
  return <span
            className={`status-badge status-badge--${status.statusId}`}>
            {status.statusName}
          </span>
          }

export default StatusBadge;