import React, { lazy } from 'react';
import _const from '../assets/const';

const MainScreens = lazy(() => import('./main.routes'));

const AppRouteMachine = (props) => {
    const { isAuthenticated } = props;

    return (
        <React.Suspense fallback="Verifying your account...">
            <MainScreens isAuthenticated={isAuthenticated} />
        </React.Suspense>
    );
};

export default AppRouteMachine;
