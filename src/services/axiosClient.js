import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Token hết hạn hoặc không có quyền truy cập!");
            localStorage.removeItem('token');

            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default axiosClient;