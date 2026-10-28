import React from "react"
import './style.css';

type Props = {
  size?: 'small' | 'medium' | 'large';
  // solid：青塗り、outline：白地に青文字（戻る・キャンセルなど）
  variant?: 'solid' | 'outline';
  type?: 'button' | 'submit';
  text: string;
  onClick?: () => void;
}

// size・variantでclassName（button--medium button--outline など）を切り替える
export const Button = ({size = 'medium', variant = 'solid', type = 'button', text, onClick}: Props) =>{
  return (
    <button type={type} className={`button button--${size} button--${variant}`} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
