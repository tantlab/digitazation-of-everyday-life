import React, { FC } from "react";
import { Link } from "react-router-dom";

const Header: FC<{ large?: boolean }> = ({ large }) => (
  <header>
    <div className={large ? "container-large" : "container"}>
      <Link to="/" title="Home page">
        <strong>Home</strong>
      </Link>
      <Link to="/about" title="About this project">
        <strong>About this project</strong>
      </Link>
    </div>
  </header>
);

export default Header;
