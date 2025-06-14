import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const NotFoundResult = ({ subTitle, backPageName, backUrl }) => {
    return (
        <Result
            status="404"
            title="Not found"
            subTitle={subTitle ? subTitle : 'Sorry, we cannot find this content.'}
            extra={
                <Link to={backUrl}>
                    <Button type="primary">Back to {backPageName}</Button>
                </Link>
            }
        />
    );
};

export default NotFoundResult;
