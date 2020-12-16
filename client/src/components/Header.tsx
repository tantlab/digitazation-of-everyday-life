import { FC } from "react";
import { Link } from "react-router-dom";

const Header: FC = () => (
  <header>
    <Link to="/">
      <strong>Everyday Life</strong>
    </Link>
    <Link to="/about">
      <strong>About this project</strong>
    </Link>
  </header>
);

export default Header;
