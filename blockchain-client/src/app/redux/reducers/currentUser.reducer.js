import actionTypes from '../action-types';

const initialState = {
    infoByRole: {},
    currentUser: {},
};

const currentUserReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case actionTypes.currentUser.REQUEST_GET_CURRENT_USER: {
            return { ...state };
        }
        case actionTypes.currentUser.SET_INFO_BY_ROLE: {
            return { ...state, infoByRole: payload };
        }
        case actionTypes.currentUser.REQUEST_GET_CURRENT_USER_FULFILLED: {
            return { ...state };
        }
        case actionTypes.currentUser.REQUEST_GET_CURRENT_USER_REJECTED: {
            return { ...state, infoByRole: {}, currentUser: {} };
        }
        case actionTypes.currentUser.SET_ALL_INFORMATION: {
            return {
                ...state,
                currentUser: payload,
            };
        }
        case actionTypes.currentUser.DELETE_ALL_INFORMATION: {
            return {
                ...state,
                infoByRole: {},
                currentUser: {},
            };
        }
        default:
            return state;
    }
};

export default currentUserReducer;
