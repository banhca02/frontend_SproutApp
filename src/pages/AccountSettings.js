import React, { useState, useEffect } from "react";
import axiosInstance from "../components/axiosInstance";

const AccountSettings = () => {
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const [imageFile, setImageFile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile/get/");
        const data = response.data;
        const fullName = `${data.last_name} ${data.first_name}`;

        setFullName(fullName);
        setEmail(data.email || "");
        setProfileImage(data.avatar || "");
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!imageFile) {
      alert("Vui lòng chọn một ảnh để tải lên!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", imageFile);

    try {
      const response = await axiosInstance.put("/user/profile/avatar/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        alert("Ảnh đại diện đã được cập nhật thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      alert("Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại.");
    }
  };

  const handleSaveChanges = () => {
    alert("Thông tin cá nhân đã được cập nhật!");
    handleSaveAvatar(); // Gửi ảnh nếu có
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    alert("Mật khẩu đã được thay đổi thành công!");
    // Có thể gọi API đổi mật khẩu ở đây nếu muốn
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Cài Đặt Tài Khoản</h2>

      {/* Thông Tin Cá Nhân */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Thông Tin Cá Nhân</h3>
        <div className="flex items-center space-x-4 mb-4">
          <img src={profileImage} alt="Avatar" className="w-20 h-20 rounded-full border" />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <label className="block mb-1">Họ và tên</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full p-2 border bg-gray-100 rounded mb-3"
        />
        <button
          onClick={handleSaveChanges}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Lưu thay đổi
        </button>
      </div>

      {/* Thay Đổi Mật Khẩu */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Thay Đổi Mật Khẩu</h3>
        <label className="block mb-1">Mật khẩu hiện tại</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <label className="block mb-1">Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <label className="block mb-1">Xác nhận mật khẩu mới</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
