import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../components/axiosInstance"; 
import Logo from "../assets/LogoWebsite.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await axiosInstance.post("/user/signup/", {
        email: formData.email,
        password: formData.password,
        username: formData.email.split('@')[0],
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng ký:", err.response?.data || err.message);
      alert("Đăng ký thất bại: " + (err.response?.data?.detail || "Lỗi không xác định"));
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-16">
        <img src={Logo} alt="SmartSprout" className="w-24 mb-4" />
        <h2 className="text-3xl font-bold text-green-500 font-dancing">SmartSprout</h2>
        <p className="text-gray-500 mb-6">Tạo tài khoản mới để bắt đầu</p>

        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium mb-1">Họ</label>
              <input
                type="text"
                name="lastName"
                placeholder="Họ"
                className="w-full p-3 border rounded-lg"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium mb-1">Tên</label>
              <input
                type="text"
                name="firstName"
                placeholder="Tên"
                className="w-full p-3 border rounded-lg"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <p className="text-sm italic text-gray-500 mb-2">
            Email sẽ không thể thay đổi sau này
          </p>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label className="block text-gray-700 font-medium mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            className="w-full p-3 border rounded-lg mb-4"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Đăng ký
          </button>
        </form>

        <p className="mt-4 text-gray-600 text-sm">
          Đã có tài khoản?{" "}
          <button onClick={() => navigate("/login")} className="text-green-500 hover:underline">
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
