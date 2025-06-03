import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - remove token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      throw new Error(data.message || `Server Error: ${status}`);
    } else if (error.request) {
      // Network error
      throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
    } else {
      // Something else happened
      throw new Error('요청 처리 중 오류가 발생했습니다.');
    }
  }
);

export default apiClient;