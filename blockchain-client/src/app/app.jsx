import React, { useEffect, useState } from 'react';
import AppRouteMachine from './routes';
import { useSelector, useDispatch } from 'react-redux';
import actionCreators from './redux/action-creators';
import './app.css';
import './styles.scss';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fab, fas);

const App = (props) => {
    const dispatch = useDispatch();
    const authorizationReducer = useSelector((state) => state.authorizationReducer);
    const { isAuthenticated, role } = authorizationReducer;
    const localAccessToken = localStorage.getItem('accessToken');
    const localRefreshToken = localStorage.getItem('refreshToken');
    const [isLoading, setIsLoading] = useState(true);

    // Verify access token when it appears in localStorage (redux-thunk)
    useEffect(() => {
        setIsLoading(true);
        if (!localAccessToken) dispatch(actionCreators.authorization.setIsAuthenticated(false));
        else {
            dispatch(
                actionCreators.authorization.verifyAccessTokenAndGetUserRole(
                    localAccessToken,
                    localRefreshToken,
                ),
            );
        }
        setIsLoading(false);
    }, [localAccessToken, localRefreshToken, dispatch, setIsLoading]);

    return (
        <div className="app">
            {!isLoading && <AppRouteMachine isAuthenticated={isAuthenticated} />}
        </div>
    );
};

export default App;
