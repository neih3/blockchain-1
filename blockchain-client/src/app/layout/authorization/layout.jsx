import React from 'react';
import { Row, Col } from 'antd';
import '../layout.scss';
import appConfig from '../../../appConfig.json';

const AuthorizationLayout = (props) => {
    return (
        <Row justify="center" align="middle" className="authorization">
            <Col className="col-sm-4">{props.children}</Col>
            <div className="footer">
                <span>version {appConfig.version || '1.0'}</span>
            </div>
        </Row>
    );
};

export default AuthorizationLayout;
