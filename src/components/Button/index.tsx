import React from "react"
import './style.css';

type Props = {
  size?: 'small' | 'medium' | 'large';
  text: string;
  onClick?:() => void;
}

export const Button = ({size,text,onClick}: Props) =>{
  if(size === 'small'){
    return <button className="small" onClick={onClick}>{text}</button>
  }
  if(size === 'large'){
    return <button className="large" onClick={onClick}>{text}</button>
  }
  return <button className="medium" onClick={onClick}>{text}</button>
}

export default Button;