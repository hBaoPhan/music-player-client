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
        const isNotOnLoginPage = window.location.pathname !== '/login';

        if (error.response) {
            if (error.response.status === 401 && isNotOnLoginPage) {
                console.error("Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
                localStorage.removeItem('token');
                window.location.href = '/login';
            }

            if (error.response.status === 403) {
                console.error("Bạn không có quyền (Role) để thực hiện thao tác này!");
                alert("Bạn không có quyền (Role) để thực hiện thao tác này!")
            }
        }

        return Promise.reject(error);
    }
);


export default axiosClient;