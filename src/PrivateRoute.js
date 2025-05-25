import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token"); // Kiểm tra đăng nhập
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
