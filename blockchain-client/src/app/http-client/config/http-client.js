import axios from 'axios';
import { authHeader } from './auth-header';

// config interceptors
const httpClient = axios.create();

const localServerURL = 'http://localhost:3001';

httpClient.defaults.baseURL = localServerURL;

httpClient.defaults.headers.post['Content-Type'] = 'application/json';
httpClient.interceptors.request.use(function (config) {
    config.headers.Authorization = `Bearer ${authHeader().Authorization}`;
    return config;
});

httpClient.interceptors.response.use(
    function (response) {
        if (response.status === 200 && response.data && response.data.message) {
            // toastr.success(response.data.message);
        }
        return response;
    },
    function (error) {
        let errorResponse = error.response;

        if (errorResponse.status === 401) {
            // toastr.error(errorResponse.data.message);
        }

        if (errorResponse.status === 400) {
            // toastr.error(errorResponse.data.message);
        }

        if (errorResponse.status === 403) {
            // toastr.error(errorResponse.data.message);
        }

        return Promise.reject(error);
    },
);

export default httpClient;
