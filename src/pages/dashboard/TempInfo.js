import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import WebSocketInstance from "../../components/WebSocketInstance.ts";


const DashboardTempPage = () => {

  const [temperatureBound, setTemperatureBound] = useState({ lowest: null, highest: null });
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({ lowest: "", highest: "" });
  const [currentTemp, setCurrentTemp] = useState(null);

  const navigate = useNavigate();
  // 💡 Đèn sưởi
  const [heatHistory, setHeatHistory] = useState([]);
  const [heaterOn, setHeaterOn] = useState(false);
  const [heatControlError, setHeatControlError] = useState(null);
  const [isLoadingHeatHistory, setIsLoadingHeatHistory] = useState(false);
  const [heatPage, setHeatPage] = useState(1);
  const [totalHeatPages, setTotalHeatPages] = useState(1);

  // 🌀 Quạt thông gió
  const [fanHistory, setFanHistory] = useState([]);
  const [fanOn, setFanOn] = useState(false);
  const [fanControlError, setFanControlError] = useState(null);
  const [isLoadingFanHistory, setIsLoadingFanHistory] = useState(false);
  const [fanPage, setFanPage] = useState(1);
  const [totalFanPages, setTotalFanPages] = useState(1);

  const [isHeaterFanManualMode, setIsHeaterFanManualMode] = useState(true);

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

    const fetchTempBound = async () => {
      try {
        const res = await axiosInstance.get("/temperature/bound/get/");
        setTemperatureBound({
          lowest: res.data.lowest_allowed,
          highest: res.data.highest_allowed,
        });
      } catch (err) {
        console.error("Lỗi khi tải ngưỡng nhiệt độ:", err);
      }
    };
  
    const fetchCurrentTemp = async () => {
      try {
        // Gửi request sync trước
        // await axiosInstance.post("/temperature/record/sync/");
        // Sau đó lấy giá trị mới nhất
        const res = await axiosInstance.get("/temperature/record/get/recent/?n=1");
        if (res.data && res.data.length > 0) {
          setCurrentTemp(res.data[0].value); 
        }
      } catch (err) {
        console.error("Lỗi khi lấy nhiệt độ hiện tại:", err);
      }
    };
    const fetchHeaterFanMode = async () => {
      try {
        const res = await axiosInstance.get("/temperature/control/mode/");
        setIsHeaterFanManualMode(res.data.manual);
      } catch (err) {
        console.error("Lỗi khi lấy chế độ điều chỉnh đèn sưởi và quạt:", err);
      }
    };
  
    fetchHeaterFanMode();
    fetchTempBound();
    fetchCurrentTemp();
  }, [navigate]);

  const fetchHeaterHistory = async () => {
    setIsLoadingHeatHistory(true); // Bắt đầu tải
    try {
      const res = await axiosInstance.get("/heater/history?page=1");
      const formatted = res.data.results.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: item.value > 0 ? "Bật" : "Tắt",
      }));
      setHeatHistory(formatted);
      setTotalHeatPages(Math.ceil(res.data.count / res.data.results.length));
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đèn sưởi:", err);
    } finally {
      setIsLoadingHeatHistory(false); // Kết thúc tải dù thành công hay lỗi
    }
  };
  
  const fetchFanHistory = async () => {
    setIsLoadingFanHistory(true); // Bắt đầu tải
    try {
      const res = await axiosInstance.get("/fan/history?page=1");
      const formatted = res.data.results.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: item.value > 0 ? "Bật" : "Tắt",
      }));
      setFanHistory(formatted);
      setTotalFanPages(Math.ceil(res.data.count / res.data.results.length));
    } catch (err) {
      console.error("Lỗi khi tải lịch sử quạt:", err);
    } finally {
      setIsLoadingFanHistory(false); // Kết thúc tải dù thành công hay lỗi
    }
  };

  const fetchCurrentHeaterStatus = async () => {
    try {
      const res = await axiosInstance.get("/heater/history?page=1");
      const data = res.data.results;
      if (data.length > 0) {
        const latest = data[0];
        setHeaterOn(latest.value > 0);
      }
    } catch (err) {
      console.error("Lỗi khi lấy trạng thái đèn sưởi:", err);
    }
  };
  
  const fetchCurrentFanStatus = async () => {
    try {
      const res = await axiosInstance.get("/fan/history?page=1");
      const data = res.data.results;
      if (data.length > 0) {
        const latest = data[0];
        setFanOn(latest.value > 0);
      }
    } catch (err) {
      console.error("Lỗi khi lấy trạng thái quạt:", err);
    }
  };

  useEffect(() => {
    fetchHeaterHistory();
    fetchCurrentHeaterStatus();
  }, []);
  
  useEffect(() => {
    fetchFanHistory();
    fetchCurrentFanStatus();
  }, []);

  // useEffect(() => {
  //   if (isHeaterFanManualMode) setIsHeaterFanManualMode(null);
  // }, [isHeaterFanManualMode]);
  
  
  const toggleHeater = async () => {
    if (!isHeaterFanManualMode) {
      setHeatControlError("Chỉ có thể điều chỉnh đèn sưởi ở chế độ thủ công.");
      return;
    }
  
    try {
      const newValue = heaterOn ? 0 : 1;
      const res = await axiosInstance.post("/heater/control/", {
        value: newValue,
      });
  
      const responseValue = res.data?.value;
      setHeaterOn(responseValue === 1);
      setHeatControlError(null);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
  
        if (status === 400) {
          setHeatControlError(data?.value?.[0] || "Lỗi giá trị gửi lên.");
        } else if (status === 405) {
          setHeatControlError(data?.detail || "Không được phép thực hiện thao tác này.");
        } else {
          setHeatControlError("Đã xảy ra lỗi khi điều chỉnh đèn sưởi.");
        }
      } else {
        setHeatControlError("Không thể kết nối đến máy chủ.");
      }
    }
  };

  const toggleFan = async () => {
    if (!isHeaterFanManualMode) {
      setFanControlError("Chỉ có thể điều chỉnh quạt thông gió ở chế độ thủ công.");
      return;
    }
  
    try {
      const newValue = fanOn ? 0 : 70;
      const res = await axiosInstance.post("/fan/control/", {
        value: newValue,
      });
  
      const responseValue = res.data?.value;
      setFanOn(responseValue === 70);
      setFanControlError(null);
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
  
        if (status === 400) {
          setFanControlError(data?.value?.[0] || "Lỗi giá trị gửi lên.");
        } else if (status === 405) {
          setFanControlError(data?.detail || "Không được phép thực hiện thao tác này.");
        } else {
          setFanControlError("Đã xảy ra lỗi khi điều chỉnh quạt.");
        }
      } else {
        setFanControlError("Không thể kết nối đến máy chủ.");
      }
    }
  };
  
  const handleHeaterFanModeChange = async (manual) => {
    try {
      await axiosInstance.put("/temperature/control/mode/", { manual });  
      setIsHeaterFanManualMode(manual);
    } catch (err) {
      console.error("Lỗi khi cập nhật chế độ đèn/quạt:", err);
    }
  };

  const handleEditClick = () => {
    setEditValues({
      lowest: temperatureBound.lowest,
      highest: temperatureBound.highest,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    const lowest = parseFloat(editValues.lowest);
    const highest = parseFloat(editValues.highest);



    try {
      const res = await axiosInstance.patch("/temperature/bound/update/", {
        lowest_allowed: lowest,
        highest_allowed: highest,
      });

      setTemperatureBound({
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
    const token = localStorage.getItem("access_token");
    const wsInstance = WebSocketInstance.getInstance()
    if (!wsInstance.isConnected()) {
      wsInstance.connect(token);
      wsInstance.print()
    }
    const handleMessage = (data) => {
      console.log("Dữ liệu WebSocket nhận được:", data);
      try {
        if (data.type === "temperature") {
          setCurrentTemp(data.value); 
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
        <Sidebar activeItem="temperature" />

        <div className="flex-1 p-6">
          <div className="flex justify-between">
            <div className="w-[60%]">
              <h2 className="text-xl font-bold mb-4">Nhiệt độ hiện tại</h2>
              <div className="w-48 p-4 bg-white border shadow rounded-lg flex items-center">
                <span className="text-2xl mr-2">🌡️</span>
                <div>
                  <p className="text-gray-700">Nhiệt độ</p>
                  <p className="font-bold">
                    {currentTemp !== null ? `${currentTemp}°C` : "Đang tải..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-[40%] pr-6">
              <h2 className="text-xl font-bold mb-4">Ngưỡng nhiệt độ cần thiết</h2>
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
                        {temperatureBound.lowest !== null
                          ? `${temperatureBound.lowest} °C`
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
                        {temperatureBound.highest !== null
                          ? `${temperatureBound.highest} °C`
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

          {/* Chế độ điều chỉnh cho đèn sưởi & quạt thông gió */}
          <h2 className="text-xl font-bold mt-6 mb-2">Chế độ điều chỉnh</h2>
          <div className="grid grid-cols-2 gap-x-2 w-[50%] font-bold">
            <div className="p-4 py-6 bg-white border shadow rounded-lg flex items-center">
              <input
                type="radio"
                name="heater-fan-mode"
                className="mr-2"

                checked={isHeaterFanManualMode ?? false}
                onChange={() => handleHeaterFanModeChange(true)}
              />
              <p>Thủ công</p>
            </div>
            <div className="p-4 py-6 bg-white border shadow rounded-lg flex items-center">
              <input
                type="radio"
                name="heater-fan-mode"
                className="mr-2"
                checked={!isHeaterFanManualMode ?? false}
                onChange={() => handleHeaterFanModeChange(false)}
              />
              <p>Tự động</p>
            </div>
          </div>

  

          {/* Điều chỉnh đèn và quạt */}
          <div className="flex justify-between mt-6">
            {/* Điều chỉnh đèn sưởi */}
            <div className="w-[48%]">
              <h2 className="text-xl font-bold mb-2">Điều chỉnh đèn sưởi</h2>
              <div className="bg-white border shadow rounded-lg flex items-center p-4 py-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={heaterOn}
                    onChange={toggleHeater}
                  />
                  <div
                    className={`relative w-11 h-6 ${
                      !isHeaterFanManualMode ? 'bg-gray-300' : 'bg-gray-400'
                    } peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      heaterOn ? 'peer-checked:bg-green-500' : ''
                    }`}
                  ></div>
                  <span className="ms-3 text-sm font-bold">{heaterOn ? 'Bật' : 'Tắt'}</span>
                </label>
              </div>
              {heatControlError && (
                <div className="mt-2 text-red-600 text-sm">{heatControlError}</div>
              )}
            </div>

            {/* Điều chỉnh quạt thông gió */}
            <div className="w-[48%]">
              <h2 className="text-xl font-bold mb-2">Điều chỉnh quạt thông gió</h2>
              <div className="bg-white border shadow rounded-lg flex items-center p-4 py-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={fanOn}
                    onChange={toggleFan}
                  />
                  <div
                    className={`relative w-11 h-6 ${
                      !isHeaterFanManualMode ? 'bg-gray-300' : 'bg-gray-400'
                    } peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      fanOn ? 'peer-checked:bg-green-500' : ''
                    }`}
                  ></div>
                  <span className="ms-3 text-sm font-bold">{fanOn ? 'Bật' : 'Tắt'}</span>
                </label>
              </div>
              {fanControlError && (
                <div className="mt-2 text-red-600 text-sm">{fanControlError}</div>
              )}
            </div>
          </div>


          {/* Lịch sử hoạt động đèn sưởi và quạt */}
          <div className="flex justify-between mt-6">
            {/* Đèn sưởi */}
            <div className="w-[48%]">
              <h2 className="text-xl font-bold mb-2">Lịch sử hoạt động đèn sưởi</h2>
              <div className="border rounded-lg shadow-md bg-white">
                {isLoadingHeatHistory ? (
                  <div className="p-4 text-sm text-gray-500">Đang tải lịch sử...</div>
                ) : heatHistory.length > 0 ? (
                  heatHistory.map((item, index) => (
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

                {/* 🔽 Phân trang đèn sưởi */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                  <button
                    onClick={() => setHeatPage((prev) => Math.max(1, prev - 1))}
                    disabled={heatPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {heatPage} / {totalHeatPages}
                  </span>
                  <button
                    onClick={() => setHeatPage((prev) => Math.min(totalHeatPages, prev + 1))}
                    disabled={heatPage === totalHeatPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>

            {/* Quạt thông gió */}
            <div className="w-[48%]">
              <h2 className="text-xl font-bold mb-2">Lịch sử hoạt động quạt</h2>
              <div className="border rounded-lg shadow-md bg-white">
                {isLoadingFanHistory ? (
                  <div className="p-4 text-sm text-gray-500">Đang tải lịch sử...</div>
                ) : fanHistory.length > 0 ? (
                  fanHistory.map((item, index) => (
                    <div key={index} className="flex items-center px-4 py-3 border-b last:border-none">
                      <span className="mr-2 text-lg">🌀</span>
                      <div className="flex-grow">
                        <p className="text-sm font-semibold">Thời gian: {item.time}</p>
                        <p className="text-sm">Trạng thái: {item.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500">Không có dữ liệu.</div>
                )}

                {/* 🔽 Phân trang quạt */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                  <button
                    onClick={() => setFanPage((prev) => Math.max(1, prev - 1))}
                    disabled={fanPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {fanPage} / {totalFanPages}
                  </span>
                  <button
                    onClick={() => setFanPage((prev) => Math.min(totalFanPages, prev + 1))}
                    disabled={fanPage === totalFanPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardTempPage;
