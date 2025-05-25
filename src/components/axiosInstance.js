import axios from "axios";

const api = process.env.API_URL;
//const api =  'https://doandanganh.onrender.com/api' 
//const api = 'http://localhost:8000/api'
// Tạo một instance mới của axios
const axiosInstance = axios.create({
  baseURL: api,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gán token trước mỗi request nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm gọi API refresh token
const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("Không tìm thấy refresh token");

  const response = await axios.post(api + "/user/refresh/", {
    refresh,
  });

  return response.data; // { access, refresh }
};

// Tự động xử lý khi token hết hạn (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn và chưa thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await refreshToken();
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);

        // Gán lại access token mới vào header
        originalRequest.headers["Authorization"] = `Bearer ${tokens.access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Làm mới token thất bại:", err);
        localStorage.clear();
        window.location.href = "/login"; // Điều hướng về login nếu token refresh lỗi
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
