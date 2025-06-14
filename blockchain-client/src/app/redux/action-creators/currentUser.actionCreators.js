import actionTypes from '../action-types';
import apiMethods from '../../http-client/api-methods';
import { createActionCreators } from './utilities';

const setAllInformation = (values) =>
    createActionCreators(actionTypes.currentUser.SET_ALL_INFORMATION, values);

const deleteAllInformation = () =>
    createActionCreators(actionTypes.currentUser.DELETE_ALL_INFORMATION);

const setUserRole = (value) =>
    createActionCreators(actionTypes.currentUser.SET_INFO_BY_ROLE, value);

const requestGetCurrentUser = () =>
    createActionCreators(actionTypes.currentUser.REQUEST_GET_CURRENT_USER);

const requestGetCurrentUserFulfilled = () =>
    createActionCreators(actionTypes.currentUser.REQUEST_GET_CURRENT_USER_FULFILLED);

const requestGetCurrentUserRejected = () =>
    createActionCreators(actionTypes.currentUser.REQUEST_GET_CURRENT_USER_REJECTED);

const getCurrentUser = () => {
    return (dispatch) => {
        dispatch(requestGetCurrentUser());
        return apiMethods.currentUser
            .getCurrentUser()
            .then((result) => result.data?.data)
            .then((result) => {
                console.log('current: ', result);
                dispatch(requestGetCurrentUserFulfilled());
                dispatch(setAllInformation(result));
            })
            .catch((err) => {
                dispatch(requestGetCurrentUserRejected());
            });
    };
};

export default {
    getCurrentUser,
    deleteAllInformation,
};
