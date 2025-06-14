import React, { useState, useEffect, Fragment } from 'react';
import EmployeeCustomSidebar from './custom-side-bar';
import { Container, Col, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import './layout.scss';
import { useLocation } from 'react-router';
import _const from '../assets/const';
import actionCreators from '../redux/action-creators';
import appConfig from '../../appConfig.json';
import BottomNavBar from './nav-bar';

const UsersLayout = (props) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const currentUserReducer = useSelector((state) => state.currentUserReducer);
    const { username } = currentUserReducer.currentUser;
    const [menuCollapse, setMenuCollapse] = useState(false);
    const [activeMenu, setActiveMenu] = useState(false);

    useEffect(() => {
        const pathName = location.pathname;
        if (pathName === '/') {
            setActiveMenu(pathName);
        }
        const elements = pathName.split('/');
        if (pathName !== activeMenu && elements[1]) {
            setActiveMenu(`/${elements[1]}`);
        }
    }, [location.pathname, activeMenu]);
    return (
        <Fragment>
            {/* <SideBar /> */}
            {/* <EmployeeHeaderNavbar username={username} /> */}
            <div className="main-layout">
                <Container fluid className="app-container">
                    <Row className="justify-content-center">
                        <Col
                            xs={12}
                            sm={12}
                            md={11}
                            lg={10}
                            xl={9}
                            xxl={8}
                            className="content-column"
                        >
                            {props.children}
                        </Col>
                    </Row>
                </Container>
                <BottomNavBar />
            </div>
        </Fragment>
    );
};

export default UsersLayout;
