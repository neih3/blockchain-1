import actionTypes from '../action-types';

const initialState = {
    tokens: {
        accessToken: '',
        refreshToken: '',
    },
    role: '',
    isAuthenticated: true,
    isLoading: false,
    error: false,
};

const authorizationReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case actionTypes.authorization.REQUEST_LOG_IN: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case actionTypes.authorization.REQUEST_LOG_IN_FULFILLED: {
            return {
                ...state,
                isLoading: false,
                error: false,
            };
        }
        case actionTypes.authorization.REQUEST_LOG_IN_REJECTED: {
            return {
                ...state,
                isLoading: false,
                error: true,
            };
        }
        case actionTypes.authorization.SET_ACCESS_TOKEN: {
            return {
                ...state,
                tokens: { ...state.tokens, accessToken: payload },
            };
        }
        case actionTypes.authorization.SET_REFRESH_TOKEN: {
            return {
                ...state,
                tokens: { ...state.tokens, refreshToken: payload },
            };
        }
        case actionTypes.authorization.SET_IS_AUTHENTICATED: {
            return {
                ...state,
                isAuthenticated: payload,
            };
        }
        case actionTypes.authorization.SET_ROLE: {
            return {
                ...state,
                role: payload,
            };
        }
        default:
            return state;
    }
};

export default authorizationReducer;
