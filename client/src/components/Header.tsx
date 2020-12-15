import { FC } from "react";
import { Link } from "react-router-dom";

const Header: FC = () => (
  <header>
    <Link to="/">
      <strong>Everyday Life</strong>
    </Link>
  </header>
);

export default Header;
