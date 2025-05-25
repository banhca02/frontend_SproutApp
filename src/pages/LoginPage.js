import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../components/axiosInstance";
import Logo from "../assets/LogoWebsite.png";
import WebSocketInstance from '../components/WebSocketInstance.ts';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/user/login/", { email, password });
      const data = res.data;

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      WebSocketInstance.getInstance().connect(data.access)

      navigate("/dashboard/overview");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Đăng nhập thất bại");
      } else {
        setError("Có lỗi xảy ra khi kết nối đến server");
      }
    }
  };

    return (
        <div className="flex h-screen justify-center items-center">
            <div className="w-full max-w-md flex flex-col justify-center items-center px-8">
                <img src={Logo} alt="SmartSprout" className="w-24 mb-4" />
                <h2 className="text-3xl font-bold text-green-500 font-dancing">SmartSprout</h2>
                <p className="text-gray-500 mb-6">Chào mừng bạn đến với SmartSprout</p>

                <form className="w-full" onSubmit={handleLogin}>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                        type="email"
                        placeholder="Nhập email"
                        className="w-full p-3 border rounded-lg mb-4"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        className="w-full p-3 border rounded-lg mb-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div>
                            <input type="checkbox" id="remember" className="mr-1" />
                            <label htmlFor="remember">Lưu đăng nhập</label>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-green-500 hover:underline"
                        >
                            Quên mật khẩu
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Đăng nhập
                    </button>
                </form>

                <button onClick={() => navigate("/")} className="mt-4 text-green-500 hover:underline">
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
