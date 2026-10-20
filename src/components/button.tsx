import React from "react"
import './button.css';

type Props = {
  size?: 'small' | 'medium' | 'large';
  text: string;
}

export const Button = ({size,text}: Props) =>{

  if(size === 'small'){
    return <button className="small">{text}</button>
  }
  if(size === 'large'){
    return <button className="large">{text}</button>
  }
  return <button className="medium">{text}</button>
}

export default Button;