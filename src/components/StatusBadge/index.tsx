import React from "react"
import './style.css';
import type { Reservation } from '../../types/management';

type Props = {
  label: string;
  situation: Reservation['status'];
};

export const StatusBadge = ({label, situation}: Props) =>{
  return(
  <span
    className={`status-badge status-badge--${situation}`}>
    {label}
  </span>
  );
};
export default StatusBadge;