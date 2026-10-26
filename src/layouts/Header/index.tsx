import React from "react";
import './style.css';
import heartIcon from '../../Image/heart.png';
import { Link } from "react-router-dom";

type HeaderProps = {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header className="header">
      {/* ホーム画面に戻る */}
      <Link to="/" className="header_logo">
        <img src={heartIcon} alt="" className="header_icon" />
        <h1 className="header_title">{title}</h1>
      </Link>
    </header>
  );
};

export default Header;