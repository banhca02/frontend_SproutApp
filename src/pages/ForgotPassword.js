import React, { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            setMessage("Vui lòng nhập email.");
            return;
        }

        // Giả lập gửi email (có thể thay bằng API thực tế)
        setTimeout(() => {
            setMessage("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.");
        }, 1000);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold text-center text-gray-700">Quên mật khẩu</h2>
                <p className="text-sm text-gray-500 text-center mt-2">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                </p>

                {message && (
                    <div className="mt-4 p-3 text-sm text-green-600 bg-green-100 rounded-md">
                        {message}
                    </div>
                )}

                <form className="mt-6" onSubmit={handleSubmit}>
                    <label className="block text-gray-600 text-sm font-medium mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
                    >
                        Gửi yêu cầu
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/login" className="text-sm text-blue-500 hover:underline">
                        Quay lại đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
