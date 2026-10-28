import React from "react"
import './style.css';

type Props = {
  size?: 'small' | 'medium' | 'large';
  text: string;
  onClick?: () => void;
}

// sizeでclassName（button--small / button--medium / button--large）を切り替える
export const Button = ({size = 'medium', text, onClick}: Props) =>{
  return (
    <button type="button" className={`button button--${size}`} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
