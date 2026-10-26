import React from "react";
import './style.css';
import heartIcon from '../../Image/heart.png';

type HeaderProps = {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header_logo">
        <img src={heartIcon} alt="" className="header_icon" />
        <h1 className="header_title">{title}</h1>
      </div>
    </header>
  );
};

export default Header;