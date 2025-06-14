import actionTypes from '../action-types';
import apiMethods from '../../http-client/api-methods';
import actionCreators from '.';
import { createActionCreators } from './utilities';
import MessageBox from '../../helpers/MessageBox';

// function to add tokens to Redux store, localStorage
const addCredentials = (dispatch, accessToken, refreshToken, role) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    dispatch(setAccessToken(accessToken));
    dispatch(setRefreshToken(refreshToken));
    dispatch(setRole(role));
};

// function to add tokens to Redux store, localStorage
const deleteCredentials = (dispatch) => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(setAccessToken(''));
    dispatch(setRefreshToken(''));
    dispatch(setRole(''));
};

const setRole = (value) => createActionCreators(actionTypes.authorization.SET_ROLE, value);

const setAccessToken = (value) =>
    createActionCreators(actionTypes.authorization.SET_ACCESS_TOKEN, value);

const setRefreshToken = (value) =>
    createActionCreators(actionTypes.authorization.SET_REFRESH_TOKEN, value);

const setIsAuthenticated = (value) =>
    createActionCreators(actionTypes.authorization.SET_IS_AUTHENTICATED, value);

const requestLogIn = () => createActionCreators(actionTypes.authorization.REQUEST_LOG_IN);

const requestLogInFulfilled = () =>
    createActionCreators(actionTypes.authorization.REQUEST_LOG_IN_FULFILLED);

const requestLogInRejected = () =>
    createActionCreators(actionTypes.authorization.REQUEST_LOG_IN_REJECTED);

const requestVerifyAccessToken = () =>
    createActionCreators(actionTypes.authorization.REQUEST_VERIFY_ACCESS_TOKEN);

const requestVerifyAccessTokenFulfilled = () =>
    createActionCreators(actionTypes.authorization.REQUEST_VERIFY_ACCESS_TOKEN_FULFILLED);

const requestVerifyAccessTokenRejected = () =>
    createActionCreators(actionTypes.authorization.REQUEST_VERIFY_ACCESS_TOKEN_REJECTED);

const verifyAccessTokenAndGetUserRole = (accessToken, refreshToken) => {
    return async (dispatch) => {
        dispatch(requestVerifyAccessToken());
        return apiMethods.authorization
            .verifyAccessToken()
            .then((result) => result.data?.data)
            .then((result) => {
                dispatch(requestVerifyAccessTokenFulfilled());
                dispatch(actionCreators.currentUser.getCurrentUser());
                addCredentials(dispatch, accessToken, refreshToken, '');
                dispatch(setIsAuthenticated(true));
            })
            .catch((err) => {
                deleteCredentials(dispatch);
                dispatch(requestVerifyAccessTokenRejected());
            });
    };
};

const logIn = (values) => {
    return (dispatch) => {
        dispatch(requestLogIn());
        return apiMethods.authorization
            .logInWithEmailAndPassword(values.username, values.password)
            .then((result) => result.data)
            .then((result) => {
                dispatch(requestLogInFulfilled());
                addCredentials(dispatch, result.accessToken, result.refreshToken, '');
                MessageBox.show({
                    content: 'Login successfully!',
                    messageType: MessageBox.MessageType.Success,
                    key: 'login',
                });
            })
            .catch((err) => {
                if (err.response?.data) {
                    MessageBox.show({
                        content: err.response?.data?.message,
                        messageType: MessageBox.MessageType.Error,
                        key: 'login',
                    });
                } else
                    MessageBox.show({
                        content: 'Login failed!',
                        messageType: MessageBox.MessageType.Error,
                        key: 'login',
                    });
                dispatch(requestLogInRejected());
            });
    };
};

const signOut = () => {
    return (dispatch) => {
        deleteCredentials(dispatch);
        dispatch(setIsAuthenticated(false));
    };
};

export default {
    setIsAuthenticated,
    logIn,
    signOut,
    verifyAccessTokenAndGetUserRole,
    addCredentials,
    deleteCredentials,
};
