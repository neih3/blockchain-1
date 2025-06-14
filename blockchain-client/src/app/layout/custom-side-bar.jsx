//import useState hook to create menu collapse state
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaPager,
    FaBuffer,
    FaLocationArrow,
    FaUserGraduate,
    FaHome,
    FaSignOutAlt,
    FaPenNib,
} from 'react-icons/fa';
import './custom-side-bar.scss';

const Sidebar = (props) => {
    const { setMenuCollapse, menuCollapse, signOut, activeMenu } = props;
    const location = useLocation();

    const menuIconClick = () => {
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };

    return (
        <ul>
            <div className="logo">
                <span>LOGO</span>
                {/* <div className="toggle-button" onClick={menuIconClick}>
                    {menuCollapse ? <FiArrowRightCircle /> : <FiArrowLeftCircle />}
                </div> */}
            </div>
            <Link to="/">
                <li className={activeMenu === '/' ? 'active' : ''}>
                    <span className="li-icon">
                        <FaHome />
                    </span>
                    <span className="li-text collapsed">Home</span>
                </li>
            </Link>
            <Link to="/classes">
                <li className={activeMenu === '/classes' ? 'active' : ''}>
                    <span className="li-icon">
                        <FaPager />
                    </span>
                    <span className="li-text">Classes</span>
                </li>
            </Link>
            <Link to="/students">
                <li className={activeMenu === '/students' ? 'active' : ''}>
                    <span className="li-icon">
                        <FaUserGraduate />
                    </span>
                    <span className="li-text">Students</span>
                </li>
            </Link>
            <Link to="/class-places">
                <li className={activeMenu === '/class-places' ? 'active' : ''}>
                    <span className="li-icon">
                        <FaLocationArrow />
                    </span>
                    <span className="li-text">Class places</span>
                </li>
            </Link>
            <Link to="/class-types">
                <li className={activeMenu === '/class-types' ? 'active' : ''}>
                    <span className="li-icon">
                        <FaBuffer />
                    </span>
                    <span className="li-text">Class types</span>
                </li>
            </Link>
            <div className="sidebar-footer">
                <Link to="/profile">
                    <li className={activeMenu === '/profile' ? 'active' : ''}>
                        <span className="li-icon">
                            <FaPenNib />
                        </span>
                        <span className="li-text">Profile</span>
                    </li>
                </Link>
                <li className="logout-option" onClick={signOut}>
                    <span className="li-icon">
                        <FaSignOutAlt />
                    </span>
                    <span className="li-text">Logout</span>
                </li>
            </div>
        </ul>
    );
};

export default Sidebar;
