import React from "react";
import './style.css';

type StepperProps = {
  steps: string[];
  currentStep: number;
};

// 日付選択　時間選択　予約完了
type Status = 'complete' | 'current' | 'upcoming';

const getStatus = (index: number, currentStep: number): Status => {
  if (index < currentStep) return 'complete';
  if (index === currentStep) return 'current';
  return 'upcoming';
};
export const Stepper = ({ steps, currentStep}: StepperProps) => {
  return(
    <ol className="stepper">
        {steps.map((step, index) => {
        const status = getStatus(index, currentStep);
        return(
          <li
          key={step}
          className={`stepper_item stepper_item--${status}`}
          aria-current={status === 'current' ? 'step' : undefined}
          >
            <span className="stepper_cycle" />
            <span className="stepper_label">{step}</span>
          </li>
        );
      })}
    </ol>
  )
};

export default Stepper;
