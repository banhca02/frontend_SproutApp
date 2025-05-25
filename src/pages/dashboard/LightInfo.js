import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import WebSocketInstance from "../../components/WebSocketInstance.ts";


const DashboardLightPage = () => {
  const [lightBound, setLightBound] = useState({
    lowest: null,
    highest: null,
  });

  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({ lowest: "", highest: "" });
  const [error, setError] = useState(null);
  const [currentLight, setCurrentLight] = useState(null);
  const navigate = useNavigate();
  const [isManualMode, setIsManualMode] = useState(null);
  const [lightHistory, setLightHistory] = useState([]);
  const [lightOn, setLightOn] = useState(false);
  const [lightControlError, setLightControlError] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
      
    if (!token) {
      navigate("/login");
      return;
    }
  
    let decoded;
    try {
      decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        navigate("/login");
        return;
      }
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      navigate("/login");
      return;
    }

    const fetchLightBound = async () => {
      try {
        const res = await axiosInstance.get("/light/bound/get/");
        setLightBound({
          lowest: res.data.lowest_allowed,
          highest: res.data.highest_allowed,
        });
      } catch (err) {
        console.error("Lỗi khi tải ngưỡng ánh sáng:", err);
      }
    };

    const fetchCurrentLight = async () => {
      try {
        // await axiosInstance.post("/light/record/sync/");
        const res = await axiosInstance.get("/light/record/get/recent/?n=1");
        if (res.data && res.data.length > 0) {
          setCurrentLight(res.data[0].value);
        }
      } catch (err) {
        console.error("Lỗi khi lấy ánh sáng hiện tại:", err);
      }
    };
    const fetchLightMode = async () => {
      try {
        const res = await axiosInstance.get("/light/control/mode/");
        setIsManualMode(res.data.manual);
      } catch (err) {
        console.error("Lỗi khi lấy chế độ điều chỉnh:", err);
      }
    };

    fetchLightMode();
    fetchLightBound();
    fetchCurrentLight();
  }, [navigate]);

  const fetchPaginatedHistory = async (page) => {
    setIsLoadingHistory(true); // Bắt đầu tải
    try {
      const res = await axiosInstance.get(`/light/control/illuminator/get/?page=${page}`);
      const formatted = res.data.results.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: item.value > 0 ? "Bật" : "Tắt",
      }));
  
      setLightHistory(formatted);
      setTotalPages(Math.ceil(res.data.count / res.data.results.length));
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đèn:", err);
    } finally {
      setIsLoadingHistory(false); // Kết thúc tải dù thành công hay lỗi
    }
  };
  useEffect(() => {
    fetchPaginatedHistory(historyPage);
  }, [historyPage]);

  const fetchCurrentLightStatus = async () => {
    try {
      const res = await axiosInstance.get("/light/control/illuminator/get/?page=1"); // Trang đầu
      const data = res.data.results;
      if (data.length > 0) {
        const latest = data[0]; // Phần tử đầu tiên là mới nhất
        setLightOn(latest.value > 0 ? true : false);
      }
    } catch (err) {
      console.error("Lỗi khi lấy trạng thái đèn:", err);
    }
  };
  
  useEffect(() => {
    fetchCurrentLightStatus();
  }, []);


  useEffect(() => {
    setHistoryPage(1);
  }, [isManualMode, lightOn]);
  
  useEffect(() => {
    if (isManualMode) {
      setLightControlError(null);
    }
  }, [isManualMode]);
  

  const toggleLight = async () => {
    if (!isManualMode) {
      setLightControlError("Chỉ có thể điều chỉnh đèn ở chế độ thủ công.");
      return;
    }
  
    try {
      const newValue = lightOn ? 0 : 1;
      const res = await axiosInstance.post("/light/control/illuminator/signal/", {
        value: newValue,
      });
  
      setLightOn(res.data.value === 1);
      setLightControlError(null);
    } catch (err) {
      if (err.response?.status === 400) {
        setLightControlError(err.response.data.value?.[0] || "Lỗi giá trị gửi lên.");
      } else if (err.response?.status === 405) {
        setLightControlError(err.response.data.detail);
      } else {
        setLightControlError("Đã xảy ra lỗi khi điều chỉnh đèn.");
      }
    }
  };
  
  const handleModeChange = async (manual) => {
    try {
      await axiosInstance.put("/light/control/mode/", { manual });
      setIsManualMode(manual);
    } catch (err) {
      console.error("Lỗi khi cập nhật chế độ:", err);
    }
  };

  const handleEditClick = () => {
    setEditValues({
      lowest: lightBound.lowest,
      highest: lightBound.highest,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    const lowest = parseFloat(editValues.lowest);
    const highest = parseFloat(editValues.highest);
  
    // Kiểm tra hợp lệ
    if (
      isNaN(lowest) || isNaN(highest) ||
      lowest < 0 || lowest > 100 ||
      highest < 0 || highest > 100
    ) {
      setError({ detail: "Giá trị ánh sáng phải nằm trong khoảng từ 0 đến 100%" });
      return;
    }
  
    try {
      const res = await axiosInstance.patch("/light/bound/update/", {
        lowest_allowed: lowest,
        highest_allowed: highest,
      });
      setLightBound({
        lowest: res.data.lowest_allowed,
        highest: res.data.highest_allowed,
      });
      setEditing(false);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      if (err.response?.status === 400) {
        setError(err.response.data);
      } else if (err.response?.status === 405) {
        setError({ detail: err.response.data.detail });
      } else {
        setError({ detail: "Đã xảy ra lỗi không xác định" });
      }
    }
  };
  

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const wsInstance = WebSocketInstance.getInstance()
    if (!wsInstance.isConnected()) {
      wsInstance.connect(token);
      wsInstance.print()
    }
    const handleMessage = (data) => {
      console.log("Dữ liệu WebSocket nhận được:", data);
      try {
        if (data.type === "light") {
          setCurrentLight(data.value); 
        } else {
          console.warn("Không xác định loại dữ liệu:", data.type);
        }
      } catch (err) {
        console.error("Lỗi phân tích WebSocket message:", err);
      }
    };
    wsInstance.addListener("message", handleMessage);
    return () => {
      wsInstance.removeListener("message", handleMessage);
      wsInstance.disconnect()
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-grow">
        <Sidebar activeItem="light" />
        <div className="flex-1 p-6">
          <div className="flex justify-between">
            <div className="w-[60%]">
              <h2 className="text-xl font-bold mb-4">Độ sáng hiện tại</h2>
              <div className="w-48 p-4 bg-white border shadow rounded-lg flex items-center">
                <span className="text-2xl mr-2">☀️</span>
                <div>
                  <p className="text-gray-700">Ánh sáng</p>
                  <p className="font-bold">
                    {currentLight !== null ? `${currentLight} %` : "Đang tải..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Ngưỡng ánh sáng */}
            <div className="w-[40%] pr-6">
              <h2 className="text-xl font-bold mb-4">Mức độ sáng cần thiết</h2>

              <div
                className={`grid grid-rows-2 gap-y-2 p-4 border shadow rounded-lg items-center font-bold ${
                  editing ? "bg-yellow-50 border-yellow-500" : "bg-white"
                }`}
              >
                {/* HÀNG TỪ */}
                <div className="flex justify-between items-center">
                  <div className="w-[18%]">Từ</div>
                  <div className="flex-grow mx-1">
                    {editing ? (
                      <div className="border border-yellow-500 rounded px-2 py-1 bg-white">
                        <input
                          type="number"
                          name="lowest"
                          value={editValues.lowest}
                          onChange={handleChange}
                          className="w-full outline-none"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-300 rounded-sm text-center py-1">
                        {lightBound.lowest !== null
                          ? `${lightBound.lowest} %`
                          : "Đang tải..."}
                      </div>
                    )}
                  </div>
                  <div className="w-[26%]"></div>
                </div>

                {/* HÀNG ĐẾN */}
                <div className="flex justify-between items-center">
                  <div className="w-[18%]">Đến</div>
                  <div className="flex-grow mx-1">
                    {editing ? (
                      <div className="border border-yellow-500 rounded px-2 py-1 bg-white">
                        <input
                          type="number"
                          name="highest"
                          value={editValues.highest}
                          onChange={handleChange}
                          className="w-full outline-none"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-300 rounded-sm text-center py-1">
                        {lightBound.highest !== null
                          ? `${lightBound.highest} %`
                          : "Đang tải..."}
                      </div>
                    )}
                  </div>
                  <div className="w-[26%] flex justify-end space-x-2">
                    {editing ? (
                      <>
                        <button
                          className="bg-green-600 text-white text-xs rounded-md px-2 hover:bg-green-700"
                          onClick={handleSave}
                        >
                          Lưu
                        </button>
                        <button
                          className="bg-gray-400 text-white text-xs rounded-md px-2 hover:bg-gray-500"
                          onClick={() => setEditing(false)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button
                        className="bg-[#598868] text-white text-xs hover:bg-green-600 rounded-md px-2"
                        onClick={handleEditClick}
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lỗi */}
              {error && (
                <div className="mt-2 text-red-600 text-sm">
                  {error.detail ||
                    error.lowest_allowed?.[0] ||
                    error.highest_allowed?.[0]}
                </div>
              )}
            </div>
          </div>

          {/* Chế độ điều chỉnh */}
          <h2 className="text-xl font-bold mt-6 mb-2">Chế độ điều chỉnh</h2>
          <div className="grid grid-cols-2 gap-x-2 w-[50%] font-bold">
            <div className="p-4 py-6 bg-white border shadow rounded-lg flex items-center">
              <input
                type="radio"
                name="light-mode"
                className="mr-2"
                checked={isManualMode === true}
                onChange={() => handleModeChange(true)}
              />
              <p>Thủ công</p>
            </div>
            <div className="p-4 py-6 bg-white border shadow rounded-lg flex items-center">
              <input
                type="radio"
                name="light-mode"
                className="mr-2"
                checked={isManualMode === false}
                onChange={() => handleModeChange(false)}
              />
              <p>Tự động</p>
            </div>
          </div>

          {/* Điều chỉnh đèn */}
          <h2 className="text-xl font-bold mt-6 mb-2">Điều chỉnh đèn</h2>
          <div className="w-[20%] bg-white border shadow rounded-lg flex items-center p-4 py-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={lightOn}
                onChange={toggleLight}
              />
              <div className={`relative w-11 h-6 ${!isManualMode ? 'bg-gray-300' : 'bg-gray-400'} peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${lightOn ? 'peer-checked:bg-green-500' : ''}`}></div>
              <span className="ms-3 text-sm font-bold">{lightOn ? "Bật" : "Tắt"}</span>
            </label>
          </div>

          {lightControlError && (
            <div className="mt-2 text-red-600 text-sm w-[40%]">{lightControlError}</div>
          )}


          {/* Lịch sử bật/tắt đèn */}
          <h2 className="text-xl font-bold mt-6 mb-2">Lịch sử bật, tắt đèn</h2>
          <div className="w-[48%] border rounded-lg shadow-md bg-white">
            {isLoadingHistory ? (
              <div className="p-4 text-sm text-gray-500">Đang tải lịch sử...</div>
            ) : lightHistory.length > 0 ? (
              lightHistory.map((item, index) => (
                <div key={index} className="flex items-center px-4 py-3 border-b last:border-none">
                  <span className="mr-2 text-lg">💡</span>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold">Thời gian: {item.time}</p>
                    <p className="text-sm">Trạng thái: {item.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500">Không có dữ liệu.</div>
            )}

            {/* 🔽 Thêm phân trang ở đây */}
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button
                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                disabled={historyPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Trang trước
              </button>
              <span>
                Trang {historyPage} / {totalPages}
              </span>
              <button
                onClick={() => setHistoryPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={historyPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
            {/* 🔼 Kết thúc phân trang */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLightPage;




