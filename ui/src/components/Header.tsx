import { Link, useLocation } from 'react-router-dom';
import "./Header.scss";
import iconImage from '../icon.png';
import { IconButton } from '@mui/material';
import { FaExternalLinkAlt } from 'react-icons/fa';

function Header() {
  const location = useLocation();
  return (
    <div className="header">
        <img src={iconImage} className="header-icon" alt="icon" />
        <Link className={`header-item ${location.pathname.startsWith('/strategies') ? 'active' : ''}`} to="/strategies">Strategies</Link>
        <Link className={`header-item ${location.pathname.startsWith('/strategy-groups') ? 'active' : ''}`} to="/strategy-groups">Strategy Groups</Link>
        <Link className={`header-item ${location.pathname.startsWith('/pair-groups') ? 'active' : ''}`} to="/pair-groups">Pair Groups</Link>
        <Link className={`header-item ${location.pathname.startsWith('/backtesting') ? 'active' : ''}`} to="/backtesting">Backtesting</Link>
        <Link className={`header-item ${location.pathname.startsWith('/helper') ? 'active' : ''}`} to="/helper">Helper</Link>
        <a className="header-item no-border end" href="https://maobui.com" target="_blank" rel="noreferrer">
          <FaExternalLinkAlt />
        </a>
    </div>
  );
}

export default Header;