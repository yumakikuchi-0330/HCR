import React from "react"
import './style.css';

type Props = {
  label: string;
  situation?: 'before' | 'inProgress' | 'complete' | 'cancel';
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