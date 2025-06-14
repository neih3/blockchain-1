import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaUser, FaCog } from 'react-icons/fa';
import './nav-bar.scss';

const BottomNavBar = () => {
    const location = useLocation();
    const navs = [
        { to: '/dashboard', icon: <FaHome />, label: 'Home' },
        { to: '/transactions', icon: <FaExchangeAlt />, label: 'Swap' },
        { to: '/advanced', icon: <FaCog />, label: 'Tools' },
        { to: '/profile', icon: <FaUser />, label: 'Profile' },
    ];
    return (
        <nav className="bottom-navbar">
            {navs.map((nav) => (
                <Link
                    key={nav.to}
                    to={nav.to}
                    className={`bottom-nav-item${
                        location.pathname.startsWith(nav.to) ? ' active' : ''
                    }`}
                >
                    <span className="icon">{nav.icon}</span>
                    <span className="label">{nav.label}</span>
                </Link>
            ))}
        </nav>
    );
};

export default BottomNavBar;
