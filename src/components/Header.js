import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Import đúng
import Logo from "../assets/LogoWebsite.png";
import { useTemperature } from "../hooks/useTemperature";
import { useLight } from "../hooks/useLight";
import { useMoisture } from "../hooks/useHumidity";
import WebSocketInstance from './WebSocketInstance.ts';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState(""); // 👈 State lưu tên người dùng
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpenNoti, setIsOpenNoti] = useState(false);
    const hasAlerts = notifications.some((notif) => notif.id !== 5)
    const currentTemp = useTemperature();
    const currentLight = useLight();
    const currentMoisture = useMoisture();

    useEffect(() => {
        // Giả lập dữ liệu cảm biến
        const sensorData = {
            light: currentLight, // Giá trị ánh sáng
            temperature: currentTemp, // Nhiệt độ
            humidity: currentMoisture, // Độ ẩm
            pest: false, // Có sâu bệnh hay không
        };
    
        const alerts = [];
    
        if (sensorData.light < 30 || sensorData.light > 80) {
        alerts.push({
            id: 1,
            message: "Cảnh báo: Mức ánh sáng không ổn định!",
            icon: <span className="text-2xl mr-2">⚠️</span>, 
            link: "/dashboard/light"
        });
        }
        if (sensorData.temperature < 18 || sensorData.temperature > 35) {
        alerts.push({
            id: 2,
            message: "Cảnh báo: Nhiệt độ vượt ngưỡng an toàn!",
            icon: <span className="text-2xl mr-2">⚠️</span>, 
            link: "/dashboard/temperature"
        });
        }
        if (sensorData.humidity < 30 || sensorData.humidity > 70) {
        alerts.push({
            id: 3,
            message: "Cảnh báo: Độ ẩm không phù hợp!",
            icon: <span className="text-2xl mr-2">⚠️</span>, 
            link: "/dashboard/humidity"
        });
        }
        if (sensorData.pest) {
        alerts.push({
            id: 4,
            message: "Cảnh báo: Phát hiện sâu bệnh!",
            icon: <span className="text-2xl mr-2">⚠️</span>, 
            link: "/dashboard/disease-status"
        });
        }
    
        if (alerts.length === 0) {
        alerts.push({
            id: 5,
            message: "Môi trường hiện tại đang ổn định!",
            icon: <span className="text-2xl mr-2">✅</span>, 
            timestamp: "Vừa xong",
        });
        }
    
        setNotifications(alerts);


        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const fullName = `${decoded.last_name} ${decoded.first_name}`;
                setUserName(fullName);
            } catch (err) {
                console.error("Token không hợp lệ:", err);
            }
        }
    }, [currentLight, currentMoisture, currentTemp]);

    return (
        <div className="h-[100px] bg-gray-100">
            
            <div className="flex items-center justify-between px-6">
                {/* Logo + Tên */}
                <div className="flex items-center space-x-2">
                    <img src={Logo} alt="Logo" className="w-[100px]" />
                    <span className="text-xl text-green-500 mt-2 font-dancing">SmartSprout</span>
                </div>
                {/* Notifications*/}
                <div className="flex items-center ml-auto space-x-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsOpenNoti(!isOpenNoti)}
                            className="flex items-center space-x-2 focus:outline-none relative"
                        >
                            <span className="text-2xl mr-2">🔔</span>
                            {hasAlerts && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Dropdown notifications */}
                        {isOpenNoti && (
                            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg">
                            <div className="py-2 border-b px-4 font-semibold">
                                <span className="text-2xl mr-2">🔔</span>
                                <span>Thông Báo</span>
                            </div>
                            <ul className="py-2 max-h-60 overflow-y-auto">
                                {notifications.map((notif) => (
                                <li key={notif.id} 
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                    onClick={() => notif.link !== "#" && navigate(notif.link)}
                                >
                                    {notif.icon}
                                    <div>
                                    <span className="block">{notif.message}</span>
                                    </div>
                                </li>
                                ))}
                            </ul>
                            <div className="border-t py-2 px-4 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                                onClick={() => navigate("/account-settings")}
                            >
                                Cài đặt thông báo
                            </div>
                            </div>
                        )}
                    </div>

                    {/* Avatar + Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <img src={Logo} alt="User Avatar" className="w-10 h-10 rounded-full border border-gray-300" />
                            <span className="text-gray-700 font-medium">{userName || "Người dùng"}</span>
                        </button>

                        {/* Dropdown menu */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
                                <ul className="py-2">
                                    <li 
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => navigate("/account-settings")} // Điều hướng đến trang cài đặt tài khoản
                                    >
                                        Cài đặt tài khoản
                                    </li>
                                    <li 
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            localStorage.removeItem("access_token");
                                            localStorage.removeItem("refresh_token");
                                            WebSocketInstance.getInstance().disconnect();
                                            navigate("/")
                                        }} 
                                    >
                                        Đăng xuất
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Đường kẻ dưới */}
            <div className="h-[6px] bg-gradient-to-b from-gray-300 to-gray-100 w-full"></div>
        </div>
    );
};

export default Header;
