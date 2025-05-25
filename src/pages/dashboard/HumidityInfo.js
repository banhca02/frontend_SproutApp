import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import WebSocketInstance from "../../components/WebSocketInstance.ts";


const DashboardHumidityPage = () => {

  const [moistureBound, setMoistureBound] = useState({ lowest: null, highest: null });
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({ lowest: "", highest: "" });
  const [currentMoisture, setCurrentMoisture] = useState(null);
  const navigate = useNavigate();
  const [pumpHistory, setPumpHistory] = useState([]);
  const [pumpOn, setPumpOn] = useState(false);
  const [isPumpManualMode, setIsPumpManualMode] = useState(true);
  const [pumpControlError, setPumpControlError] = useState(null);
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
  
    const fetchMoistureBound = async () => {
      try {
        const res = await axiosInstance.get("/moisture/bound/get/");
        setMoistureBound({
          lowest: res.data.lowest_allowed,
          highest: res.data.highest_allowed,
        });
      } catch (err) {
        console.error("Lỗi khi tải ngưỡng độ ẩm:", err);
      }
    };
  
    const fetchCurrentMoisture = async () => {
      try {
        // await axiosInstance.post("/moisture/record/sync/");
        const res = await axiosInstance.get("/moisture/record/get/recent/?n=1");
        if (res.data && res.data.length > 0) {
          setCurrentMoisture(res.data[0].value);
        }
      } catch (err) {
        console.error("Lỗi khi lấy độ ẩm hiện tại:", err);
      }
    };

    const fetchPumpMode = async () => {
      try {
        const res = await axiosInstance.get("/moisture/control/mode/");
        setIsPumpManualMode(res.data.manual);
      } catch (err) {
        console.error("Lỗi khi lấy chế độ điều chỉnh máy bơm:", err);
      }
    };
  
    fetchPumpMode();

    fetchMoistureBound();
    fetchCurrentMoisture();
  }, [navigate]);

  const fetchPaginatedPumpHistory = async (page) => {
    setIsLoadingHistory(true); // Bắt đầu tải
    try {
      const res = await axiosInstance.get(`/pumper/history?page=${page}`);
      const formatted = res.data.results.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: item.value > 0 ? "Bật" : "Tắt",
      }));
  
      setPumpHistory(formatted);
      setTotalPages(Math.ceil(res.data.count / res.data.results.length));
    } catch (err) {
      console.error("Lỗi khi tải lịch sử máy bơm:", err);
    } finally {
      setIsLoadingHistory(false); // Kết thúc tải dù thành công hay lỗi
    }
  };
  
  useEffect(() => {
    fetchPaginatedPumpHistory(historyPage);
  }, [historyPage]);
  const fetchCurrentPumpStatus = async () => {
    try {
      const res = await axiosInstance.get("/pumper/history?page=1"); // Trang đầu
      const data = res.data.results;
      if (data.length > 0) {
        const latest = data[0]; // Phần tử đầu tiên là mới nhất
        setPumpOn(latest.value > 0 ? true : false);
      }
    } catch (err) {
      console.error("Lỗi khi lấy trạng thái máy bơm:", err);
    }
  };
  useEffect(() => {
    fetchCurrentPumpStatus();
  }, []);

  useEffect(() => {
    setHistoryPage(1);
  }, [isPumpManualMode, pumpOn]);
  
  useEffect(() => {
    if (isPumpManualMode) {
      setPumpControlError(null);
    }
  }, [isPumpManualMode]);
  
  
  const togglePump = async () => {
    if (!isPumpManualMode) {
      setPumpControlError("Chỉ có thể điều chỉnh máy bơm ở chế độ thủ công.");
      return;
    }
  
    try {
      const newValue = pumpOn ? 0 : 70;
      const res = await axiosInstance.post("/pumper/control/", {
        value: newValue,
      });
  
      const responseValue = res.data?.value;
  
      // Nếu responseValue là 70 thì pump đang bật (on)
      setPumpOn(responseValue === 70);
      setPumpControlError(null);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
  
        if (status === 400) {
          setPumpControlError(data?.value?.[0] || "Lỗi giá trị gửi lên.");
        } else if (status === 405) {
          setPumpControlError(data?.detail || "Không được phép thực hiện thao tác này.");
        } else {
          setPumpControlError("Đã xảy ra lỗi khi điều chỉnh máy bơm.");
        }
      } else {
        setPumpControlError("Không thể kết nối đến máy chủ.");
      }
    }
  };  

  const handlePumpModeChange = async (manual) => {
    try {
      await axiosInstance.put("/moisture/control/mode/", { manual });
      setIsPumpManualMode(manual);
    } catch (err) {
      console.error("Lỗi khi cập nhật chế độ máy bơm:", err);
    }
  };

  const handleEditClick = () => {
    setEditValues({
      lowest: moistureBound.lowest,
      highest: moistureBound.highest,
    });
    setEditing(true);
  };
  
  const handleSave = async () => {
    const lowest = parseFloat(editValues.lowest);
    const highest = parseFloat(editValues.highest);
  
    try {
      const res = await axiosInstance.patch("/moisture/bound/update/", {
        lowest_allowed: lowest,
        highest_allowed: highest,
      });
  
      setMoistureBound({
        lowest: res.data.lowest_allowed,
        highest: res.data.highest_allowed,
      });
  
      setEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };
  

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const wsInstance = WebSocketInstance.getInstance()
    const token = localStorage.getItem("access_token");
    if (!wsInstance.isConnected()) {
      wsInstance.connect(token);
      wsInstance.print()
    }
    const handleMessage = (data) => {
      console.log("Dữ liệu WebSocket nhận được:", data);
      try {
        if (data.type === "humidity") {
          setCurrentMoisture(data.value); 
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
        <Sidebar activeItem="humidity" />
        <div className="flex-1 p-6">
          <div className="flex justify-between">
            <div className="w-[60%]">
              <h2 className="text-xl font-bold mb-4">Độ ẩm hiện tại</h2>
              <div className="w-48 p-4 bg-white border shadow rounded-lg flex items-center">
                <span className="text-2xl mr-2">💧</span>
                <div>
                  <p className="text-gray-700">Độ ẩm</p>
                  <p className="font-bold">
                    {currentMoisture !== null ? `${currentMoisture}%` : "Đang tải..."}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-[40%] pr-6">
              <h2 className="text-xl font-bold mb-4">Ngưỡng độ ẩm cần thiết</h2>
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
                        {moistureBound.lowest !== null
                          ? `${moistureBound.lowest} %`
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
                        {moistureBound.highest !== null
                          ? `${moistureBound.highest} %`
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
            </div>
          </div>
          {/* Chế độ điều chỉnh cho máy bơm nước */}
          <h2 className="text-xl font-bold mt-6 mb-2">Chế độ điều chỉnh máy bơm</h2>
          <div className="grid grid-cols-2 gap-x-2 w-[50%] font-bold">
            <div className="p-4 py-6 bg-white border shadow rounded-lg flex items-center">
              <input
                type="radio"
                name="pump-mode"
                className="mr-2"
                checked={isPumpManualMode === true}
                onChange={() => handlePumpModeChange(true)}
              />
              <p>Thủ công</p>
            </div>
            <div className="p-4 py-6 bg-white border shadow rounded-lg flex items-center">
              <input
                type="radio"
                name="pump-mode"
                className="mr-2"
                checked={isPumpManualMode === false}
                onChange={() => handlePumpModeChange(false)}
              />
              <p>Tự động</p>
            </div>
          </div>


          {/* Điều chỉnh bơm nước */}
          <h2 className="text-xl font-bold mt-6 mb-2">Điều chỉnh bơm nước</h2>
          <div className="w-[20%] bg-white border shadow rounded-lg flex items-center p-4 py-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={pumpOn}
                onChange={togglePump}
              />
              <div className={`relative w-11 h-6 ${!isPumpManualMode ? 'bg-gray-300' : 'bg-gray-400'} peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${pumpOn ? 'peer-checked:bg-green-500' : ''}`}></div>
              <span className="ms-3 text-sm font-bold">{pumpOn ? "Bật" : "Tắt"}</span>
            </label>
          </div>

          {pumpControlError && (
            <div className="mt-2 text-red-600 text-sm w-[40%]">{pumpControlError}</div>
          )}


          {/* Lịch sử hoạt động máy bơm */}
          <h2 className="text-xl font-bold mb-2">Lịch sử hoạt động máy bơm nước</h2>
          <div className="w-[48%] border rounded-lg shadow-md bg-white">
            {isLoadingHistory ? ( // hoặc isLoadingPumpHistory nếu bạn tách riêng
              <div className="p-4 text-sm text-gray-500">Đang tải lịch sử...</div>
            ) : pumpHistory.length > 0 ? (
              pumpHistory.map((item, index) => (
                <div key={index} className="flex items-center px-4 py-3 border-b last:border-none">
                  <span className="mr-2 text-lg">🚿</span>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold">Thời gian: {item.time}</p>
                    <p className="text-sm">Trạng thái: {item.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500">Không có dữ liệu.</div>
            )}

            {/* 🔽 Phân trang */}
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

export default DashboardHumidityPage;
