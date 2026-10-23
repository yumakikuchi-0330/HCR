import React, { ChangeEvent, FocusEvent, Ref } from "react";
import './style.css';

type InputProps = {
  id: string;
  label: string;
  name: string;
  type?: 'text' | 'password' | 'date';
  value?: string;
  placeholder?: string
  errorMessage?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
}

export const Input = ({
  id,
  label,
  name,
  type='text',
  value,
  errorMessage,
  placeholder,
  onChange,
  onBlur,
  ref}: InputProps) => {
    const hasError = !!errorMessage;
    return(
      <div className="input">
        <label className="input-label" htmlFor={id}>{label}</label>
        <input
        type={type}
        id={id}
        className={hasError ? 'input-field input-field--error' : 'input-field'}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        aria-invalid={hasError}
        />
        {hasError && <p id={`${id}-error`} className="input-error">{errorMessage}</p>}
      </div>
    )
  };

  export default Input;