import { Link, useLocation } from "react-router-dom";
import s from "./Nav.module.css";

export default function Nav() {
  const { pathname } = useLocation();
  return (
    <nav className={s.nav}>
      <Link to="/" className={s.logo}>
        <span className={s.logoTif}>ⵔⵉⴽⵓ</span>
        <span className={s.logoSub}>RHQ Corpus</span>
      </Link>
      <div className={s.links}>
        <Link to="/" className={pathname === "/" ? s.active : ""}>Explore</Link>
        <Link to="/submit" className={pathname === "/submit" ? s.active : ""}>Contribute</Link>
        <Link to="/admin/login" className={s.adminLink}>Admin</Link>
      </div>
    </nav>
  );
}
