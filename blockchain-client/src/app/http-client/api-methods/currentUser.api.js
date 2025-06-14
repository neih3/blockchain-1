import httpClient from '../config/http-client';

const getCurrentUser = () => {
    return httpClient
        .get('/api/auth/me')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

export default {
    getCurrentUser,
};
