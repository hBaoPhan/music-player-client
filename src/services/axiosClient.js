import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Queue status
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

//REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
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
    async (error) => {
        const originalRequest = error.config;
        const isNotOnLoginPage = window.location.pathname !== '/login';

        if (error.response) {
            if (error.response.status === 401 && !originalRequest._retry && isNotOnLoginPage) {
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return axiosClient(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const refreshText = localStorage.getItem('refreshToken');
                if (!refreshText || refreshText === 'undefined' || refreshText === 'null') {
                    console.error("Phiên đăng nhập hết hạn hoặc Refresh Token không hợp lệ. Vui lòng đăng nhập lại!");
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                try {
                    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                        refreshToken: refreshText
                    });

                    const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;

                    if (!newToken) throw new Error("Không có token mới được trả về");

                    localStorage.setItem('accessToken', newToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
                    originalRequest.headers.Authorization = 'Bearer ' + newToken;

                    processQueue(null, newToken);
                    console.log("Token refreshed successfully");

                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    console.error("Refresh token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            if (error.response.status === 403) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    console.error("Bạn không có quyền để thực hiện thao tác này!");
                    alert("Bạn không có quyền để thực hiện thao tác này!");
                }
            }
        }

        return Promise.reject(error);
    }
);


export default axiosClient;